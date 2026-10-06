import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ACTIONS, CLASSES, DECISION_EDGES, FOCUS_ACTIONS, SOURCE_EDGES, SOURCES } from "./content";
import { MetricBadge } from "./MetricBadge";
import { C, clamp, FONT, T, useFrameLayout } from "./tokens";

// ── Bézier maths ────────────────────────────────────────────────────────────
export type Pt = { x: number; y: number };
export type Bezier = [Pt, Pt, Pt, Pt];

/** B(t) = (1-t)³P0 + 3(1-t)²t P1 + 3(1-t)t² P2 + t³P3 */
export const bezierPoint = ([p0, p1, p2, p3]: Bezier, t: number): Pt => {
  const m = 1 - t;
  const a = m * m * m;
  const b = 3 * m * m * t;
  const c = 3 * m * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
};

export const bezierPath = ([p0, p1, p2, p3]: Bezier) => `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

/** Horizontal S-curve: control points pulled 55% of the gap along the x axis. */
export const connect = (from: Pt, to: Pt): Bezier => {
  const k = (to.x - from.x) * 0.55;
  return [from, { x: from.x + k, y: from.y }, { x: to.x - k, y: to.y }, to];
};

/**
 * Particle progress on its curve. `offset` is negative (a launch delay), so v < 0 = not launched.
 * t = ((frame × speed + offset) mod 100) / 100, arrivals = completed laps.
 */
export const particleState = (frame: number, speed: number, offset: number) => {
  const v = frame * speed + offset;
  if (v < 0) return { visible: false, t: 0, arrivals: 0, lastArrival: -Infinity };
  const arrivals = Math.floor(v / 100);
  return { visible: true, t: (v % 100) / 100, arrivals, lastArrival: arrivals > 0 ? (arrivals * 100 - offset) / speed : -Infinity };
};

// ── Geometry ────────────────────────────────────────────────────────────────
type NodeBox = { id: string; x: number; y: number; w: number; h: number; cx: number; cy: number };

const column = (ids: string[], left: number, w: number, h: number, top: number, height: number): NodeBox[] =>
  ids.map((id, i) => {
    const cy = top + ((i + 0.5) * height) / ids.length;
    return { id, x: left, y: cy - h / 2, w, h, cx: left + w / 2, cy };
  });

/** Node boxes for the 3 columns, computed from the frame size (works for 16:9 and 9:16). */
export const useGraphGeometry = () => {
  const { width, height, u, vertical } = useFrameLayout();
  const area = vertical
    ? { x: 36 * u, y: height * 0.235, w: width - 72 * u, h: height * 0.575 }
    : { x: 110 * u, y: 250 * u, w: width - 220 * u, h: height - 380 * u };
  const src = vertical ? { w: 236 * u, h: 84 * u } : { w: 250 * u, h: 66 * u };
  const cls = vertical ? { w: 262 * u, h: 176 * u } : { w: 340 * u, h: 122 * u };
  const act = vertical ? { w: 270 * u, h: 158 * u } : { w: 330 * u, h: 100 * u };
  const srcLeft = area.x;
  const actLeft = area.x + area.w - act.w;
  const clsLeft = (srcLeft + src.w + actLeft) / 2 - cls.w / 2;

  const sources = column(SOURCES.map((s) => s.id), srcLeft, src.w, src.h, area.y, area.h);
  const classes = column(CLASSES.map((c) => c.id), clsLeft, cls.w, cls.h, area.y, area.h);
  const actions = column(ACTIONS.map((a) => a.id), actLeft, act.w, act.h, area.y, area.h);
  const byId = Object.fromEntries([...sources, ...classes, ...actions].map((n) => [n.id, n]));

  /** Fan edges into a node so they don't all hit one pixel. */
  const port = (node: NodeBox, side: "in" | "out", list: [string, string, number][]) => {
    const peers = list.filter((e) => (side === "in" ? e[1] : e[0]) === node.id);
    return (edge: [string, string, number]) => {
      const k = peers.indexOf(edge);
      const spread = Math.min(node.h * 0.6, peers.length * 14 * u);
      const y = node.cy + (peers.length > 1 ? (k / (peers.length - 1) - 0.5) * spread : 0);
      return { x: side === "in" ? node.x : node.x + node.w, y };
    };
  };

  const edges = [
    ...SOURCE_EDGES.map((e) => ({ from: e[0], to: e[1], particles: e[2], layer: 0, curve: connect(port(byId[e[0]], "out", SOURCE_EDGES)(e), port(byId[e[1]], "in", SOURCE_EDGES)(e)) })),
    ...DECISION_EDGES.map((e) => ({ from: e[0], to: e[1], particles: e[2], layer: 1, curve: connect(port(byId[e[0]], "out", DECISION_EDGES)(e), port(byId[e[1]], "in", DECISION_EDGES)(e)) })),
  ];

  return { u, vertical, width, height, sources, classes, actions, byId, edges };
};

// ── Timing (frames relative to the graph's Sequence, which starts at T.graphIn) ──
const L = {
  srcIn: 8,
  edges0: [26, 58] as const,
  clsIn: 36,
  edges1: [54, 86] as const,
  actIn: 64,
  flow: T.flow - T.graphIn,
  zoom: T.zoom - T.graphIn,
  out: T.graphOut - T.graphIn,
};

type Particle = { edge: number; speed: number; offset: number; color: string; r: number };

const buildParticles = (edges: { layer: number; particles: number }[], u: number): Particle[] =>
  edges.flatMap((e, ei) =>
    Array.from({ length: e.particles }, (_, k) => {
      const r = (s: string) => random(`p-${ei}-${k}-${s}`);
      const speed = 1.25 + r("speed") * 0.9; // 45–80 frames per lap
      // Decision-layer particles launch later, as if fed by the first layer.
      const delay = (e.layer === 0 ? 0 : 35) + r("delay") * 70 + k * 28;
      return { edge: ei, speed, offset: -delay * speed, color: e.layer === 0 ? C.blue : C.lime, r: (e.layer === 0 ? 5 : 6) * u };
    }),
  );

/** Live arrival stats for one target node: total hits + frames since the latest hit. */
const arrivalsInto = (id: string, flowFrame: number, particles: Particle[], edges: { to: string }[]) => {
  let count = 0;
  let since = Infinity;
  for (const p of particles) {
    if (edges[p.edge].to !== id) continue;
    const s = particleState(flowFrame, p.speed, p.offset);
    count += s.arrivals;
    since = Math.min(since, flowFrame - s.lastArrival);
  }
  return { count, since };
};

const Card: React.FC<{ box: NodeBox; enter: number; dim: number; pulse: number; glow: number; children: React.ReactNode; radius: number; u: number }> = ({
  box,
  enter,
  dim,
  pulse,
  glow,
  children,
  radius,
  u,
}) => (
  <div
    style={{
      position: "absolute",
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      borderRadius: radius,
      background: C.card,
      border: `${1.5 * u}px solid ${glow > 0.01 ? C.lime : C.border}`,
      boxShadow: `0 ${8 * u}px ${24 * u}px rgba(0,0,0,0.35), 0 0 ${glow * 40 * u}px rgba(213,250,0,${glow * 0.45})`,
      opacity: enter * dim,
      scale: `${(0.85 + 0.15 * enter) * pulse}`,
      translate: `0px ${(1 - enter) * 20 * u}px`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);

export const PipelineGraph: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = useGraphGeometry();
  const { u, vertical } = g;
  const particles = buildParticles(g.edges, u);
  const flowFrame = frame - L.flow;

  const enter = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
  const pulseOf = (since: number, strength: number) =>
    !Number.isFinite(since) ? 1 : 1 + strength * (1 - spring({ frame: since, fps, config: { damping: 10, stiffness: 220 } }));

  // Act 3: dim everything except CONVERT NOW / HUMAN REVIEW and push the camera toward them.
  const focus = interpolate(frame, [L.zoom, L.zoom + 45], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const isFocusEdge = (e: { to: string }) => FOCUS_ACTIONS.includes(e.to);
  const focusNodes = FOCUS_ACTIONS.map((id) => g.byId[id]);
  const fx = focusNodes.reduce((s, n) => s + n.cx, 0) / focusNodes.length;
  const fy = focusNodes.reduce((s, n) => s + n.cy, 0) / focusNodes.length;
  // 9:16 has no headroom for a scale-up, so the camera pans and the focus cards lift instead.
  const target = vertical ? { x: g.width * 0.6, y: g.height * 0.487, s: 0.95 } : { x: g.width * 0.74, y: g.height * 0.5, s: 1.3 };

  const out = interpolate(frame, [L.out, L.out + 30], [1, 0], clamp);
  const drawn = (layer: number) => {
    const [a, b] = layer === 0 ? L.edges0 : L.edges1;
    return interpolate(frame, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  };

  return (
    <AbsoluteFill style={{ opacity: out, filter: `blur(${(1 - out) * 12 * u}px)` }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${fx}px ${fy}px`,
          scale: `${1 + (target.s - 1) * focus}`,
          translate: `${(target.x - fx) * focus}px ${(target.y - fy) * focus}px`,
        }}
      >
        <svg width={g.width} height={g.height} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="glow-lime">
              <stop offset="0%" stopColor={C.lime} stopOpacity={0.9} />
              <stop offset="100%" stopColor={C.lime} stopOpacity={0} />
            </radialGradient>
            <radialGradient id="glow-blue">
              <stop offset="0%" stopColor={C.blue} stopOpacity={0.8} />
              <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
            </radialGradient>
          </defs>

          {g.edges.map((e, i) => {
            const hot = isFocusEdge(e) ? focus : 0;
            return (
              <path
                key={i}
                d={bezierPath(e.curve)}
                fill="none"
                stroke={hot > 0.5 ? C.lime : C.olive}
                strokeWidth={(2.2 + hot * 1.5) * u}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - drawn(e.layer)}
                opacity={0.85 * (1 - focus * 0.75) + hot * 0.75}
              />
            );
          })}

          {particles.map((p, i) => {
            const s = particleState(flowFrame, p.speed, p.offset);
            if (!s.visible) return null;
            const e = g.edges[p.edge];
            const dim = isFocusEdge(e) ? 1 : 1 - focus * 0.8;
            const gid = p.color === C.lime ? "glow-lime" : "glow-blue";
            // A short comet tail: three trailing samples along the same curve.
            return (
              <g key={i} opacity={dim}>
                {[0.06, 0.04, 0.02].map((lag, k) => {
                  const q = bezierPoint(e.curve, Math.max(0, s.t - lag));
                  return <circle key={k} cx={q.x} cy={q.y} r={p.r * (0.4 + k * 0.2)} fill={p.color} opacity={0.15 + k * 0.15} />;
                })}
                {(() => {
                  const q = bezierPoint(e.curve, s.t);
                  return (
                    <>
                      <circle cx={q.x} cy={q.y} r={p.r * 3.2} fill={`url(#${gid})`} />
                      <circle cx={q.x} cy={q.y} r={p.r} fill={p.color} />
                    </>
                  );
                })()}
              </g>
            );
          })}
        </svg>

        {/* Column 1 — sources */}
        {g.sources.map((box, i) => {
          const s = SOURCES[i];
          return (
            <Card key={box.id} box={box} enter={enter(L.srcIn + i * 4)} dim={1 - focus * 0.7} pulse={1} glow={0} radius={999} u={u}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 * u, padding: `0 ${20 * u}px` }}>
                <div style={{ width: 10 * u, height: 10 * u, borderRadius: 99, background: C.blue, boxShadow: `0 0 ${10 * u}px ${C.blue}` }} />
                <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: (vertical ? 25 : 23) * u, color: C.cream, flex: 1 }}>{s.label}</div>
                <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 20 * u, color: C.canvas, background: C.blue, borderRadius: 999, padding: `${2 * u}px ${10 * u}px` }}>
                  {s.count}
                </div>
              </div>
            </Card>
          );
        })}

        {/* Column 2 — classification */}
        {g.classes.map((box, i) => {
          const c = CLASSES[i];
          const hit = arrivalsInto(box.id, flowFrame, particles, g.edges);
          return (
            <Card key={box.id} box={box} enter={enter(L.clsIn + i * 6)} dim={1 - focus * 0.7} pulse={pulseOf(hit.since, 0.035)} glow={0} radius={20 * u} u={u}>
              <div style={{ padding: `0 ${24 * u}px` }}>
                <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 20 * u, letterSpacing: 2 * u, color: C.blue }}>{c.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 * u, flexWrap: "wrap", marginTop: 4 * u }}>
                  <MetricBadge to={c.count} delay={L.clsIn + i * 6} duration={40} style={{ fontSize: (vertical ? 52 : 42) * u, color: C.cream }} />
                  <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 18 * u, color: "rgba(246,241,230,0.6)" }}>conversations</span>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Column 3 — decisions */}
        {g.actions.map((box, i) => {
          const a = ACTIONS[i];
          const hit = arrivalsInto(box.id, flowFrame, particles, g.edges);
          const focused = FOCUS_ACTIONS.includes(box.id);
          const accent = a.id === "convert" ? C.lime : C.cream;
          return (
            <Card
              key={box.id}
              box={box}
              enter={enter(L.actIn + i * 6)}
              dim={focused ? 1 : 1 - focus * 0.7}
              pulse={pulseOf(hit.since, 0.07) * (focused ? 1 + 0.08 * focus : 1)}
              glow={(focused ? focus : 0) + (Number.isFinite(hit.since) ? interpolate(hit.since, [0, 12], [0.6, 0], clamp) : 0)}
              radius={18 * u}
              u={u}
            >
              <div style={{ padding: `0 ${22 * u}px`, display: "flex", flexDirection: "column", gap: 4 * u }}>
                <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", justifyContent: "space-between", alignItems: vertical ? "flex-start" : "baseline", gap: (vertical ? 2 : 8) * u }}>
                  <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 21 * u, letterSpacing: 1.5 * u, color: C.cream, whiteSpace: "nowrap" }}>{a.label}</span>
                  <MetricBadge to={a.pct} decimals={1} suffix="%" delay={L.actIn + i * 6} duration={40} style={{ fontSize: (vertical ? 34 : 24) * u, color: accent }} />
                </div>
                <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 18 * u, color: C.blue }}>
                  <MetricBadge value={hit.count} style={{ color: C.lime, fontSize: 22 * u }} /> routed
                </div>
              </div>
            </Card>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
