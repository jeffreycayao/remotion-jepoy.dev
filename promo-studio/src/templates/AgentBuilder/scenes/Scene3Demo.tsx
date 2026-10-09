import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ActionSuiteLayout, centre, GEO, INITIAL, type LayoutState } from "../components/ActionSuiteLayout";
import { FORM, PRESETS, SELECTED_PRESET } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT, H, W } from "../tokens";
import { ClickRipple, Cursor, useFormat } from "../ui";

// Frames within the scene (383 long), from the recorded voiceover:
//   0 "Product," · 55 "Services, o Hybrid" · 106 "piliin mo lang ang preset:"
//   155 "E-commerce," · 181 "Real Estate," · 209 "Agency, o Coaching." · 261 "In five minutes, ready na…"
export const CLICK_SERVICES = 54;
export const CLICK_HYBRID = 78;
export const CLICK_PRESET = 108;
export const CLICK_SELECT = 250;
export const CLICK_GENERATE = 312;
export const CLICKS = [CLICK_SERVICES, CLICK_HYBRID, CLICK_PRESET, CLICK_SELECT, CLICK_GENERATE];

/** Hover order through the open dropdown (index into PRESETS) and when each is reached. */
const HOVERS: [number, number][] = [
  [155, 0], // "E-commerce"
  [181, 1], // "Real Estate"
  [209, 2], // "Agency"
  [222, 3], // SaaS
  [234, 4], // "Coaching"
  [244, SELECTED_PRESET], // back to Real Estate
];

/** Camera keyframes: [frame, scale, focusX, focusY] in canvas px. */
const CAMERA: [number, number, number, number][] = [
  [0, 1, 960, 540],
  [24, 1.6, 260, 470], // sidebar: Product → Services → Hybrid
  [92, 1.6, 260, 470],
  [118, 1.35, 730, 560], // preset dropdown
  [256, 1.35, 730, 560],
  [278, 1.3, 730, 760], // autofill + Generate
  [318, 1.3, 730, 760],
  [344, 1.28, 1520, 560], // instructions land in the preview
  [383, 1.32, 1520, 560],
];

/** Narrow viewports (1:1, 4:5, 9:16): absolute scales chosen so each focus area fills ~1080px of width. */
const CAMERA_NARROW: [number, number, number, number][] = [
  [0, 1.45, 330, 520],
  [24, 1.75, 300, 480], // sidebar
  [92, 1.75, 300, 480],
  [118, 1.3, 730, 600], // dropdown — the whole form card fits the width
  [256, 1.3, 730, 600],
  [278, 1.3, 730, 780], // autofill + Generate
  [318, 1.3, 730, 780],
  [344, 1.4, 1520, 600], // preview
  [383, 1.45, 1520, 600],
];

/**
 * Camera over the 1920×1080 app inside a viewport of `vw`×`vh` logical px: focus point to the
 * viewport centre, scale never below "cover", translation clamped so the app edges never show.
 */
export const cameraFor = (s: number, fx: number, fy: number, vw: number, vh: number) => {
  const sc = Math.max(s, vw / W, vh / H);
  const tx = Math.min(0, Math.max(vw - W * sc, vw / 2 - fx * sc));
  const ty = Math.min(0, Math.max(vh - H * sc, vh / 2 - fy * sc));
  return { s: sc, tx, ty };
};

const camera = (frame: number, vw: number, vh: number, wide: boolean) => {
  const table = wide ? CAMERA : CAMERA_NARROW;
  const f = table.map((k) => k[0]);
  const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const at = (i: number) => interpolate(frame, f, table.map((k) => k[i]), ease);
  return cameraFor(at(1), at(2), at(3), vw, vh);
};

/** Caption band for narrow formats — what the voice is saying, while the app plays below. */
const CAPTIONS: [number, string, string[]][] = [
  [0, "Pick your builder.", ["builder."]],
  [CLICK_PRESET - 6, "Choose an industry preset.", ["preset."]],
  [CLICK_SELECT + 4, "Auto-filled & structured.", ["structured."]],
  [CLICK_GENERATE - 2, "Generate in one click.", ["one", "click."]],
];

/** The caption band + viewport geometry for the current format. */
export const useDemoFrame = () => {
  const { mode, lw, lh, vertical, safeTop, safeBottom } = useFormat();
  if (mode === "wide") return { band: null, vp: { x: 0, y: 0, w: lw, h: lh } };
  const bandH = vertical ? 330 : mode === "tall" ? 230 : 170;
  const y = safeTop + bandH;
  const bottom = vertical ? safeBottom - 40 : safeBottom;
  return { band: { y: safeTop, h: bandH, fs: vertical ? 64 : mode === "tall" ? 56 : 46 }, vp: { x: vertical ? 0 : 40, y, w: vertical ? lw : lw - 80, h: lh - y - bottom } };
};

/** Cursor waypoints: [frame, x, y]. */
const svc = centre({ ...GEO.builderTab("Services"), w: 120, h: 0 });
const hyb = centre({ ...GEO.builderTab("Hybrid"), w: 120, h: 0 });
const presetC = { x: GEO.presetField.x + GEO.presetField.w - 120, y: GEO.presetField.y + GEO.presetField.h / 2 };
const item = (i: number) => ({ x: GEO.presetItem(i).x + 260, y: GEO.presetItem(i).y + 29 });
const gen = centre(GEO.generate);
const PATH: [number, number, number][] = [
  [18, 520, 640],
  [CLICK_SERVICES - 4, svc.x, svc.y],
  [CLICK_HYBRID - 4, hyb.x, hyb.y],
  [CLICK_PRESET - 4, presetC.x, presetC.y],
  ...HOVERS.map(([f, i]) => [f, item(i).x, item(i).y] as [number, number, number]),
  [CLICK_SELECT - 2, item(SELECTED_PRESET).x, item(SELECTED_PRESET).y],
  [CLICK_GENERATE - 4, gen.x, gen.y],
  [356, gen.x + 260, gen.y - 120],
];

const cursorAt = (frame: number) => {
  const f = PATH.map((p) => p[0]);
  const ease = { ...clamp, easing: Easing.inOut(Easing.quad) };
  return { x: interpolate(frame, f, PATH.map((p) => p[1]), ease), y: interpolate(frame, f, PATH.map((p) => p[2]), ease) };
};

/** The app state at a frame of Scene 3. */
export const demoState = (frame: number, fps: number): LayoutState => {
  const builder = frame >= CLICK_SELECT ? PRESETS[SELECTED_PRESET].builder : frame >= CLICK_HYBRID ? "Hybrid" : frame >= CLICK_SERVICES ? "Services" : "Product";
  const open = spring({ frame: frame - CLICK_PRESET, fps, config: { damping: 18, stiffness: 180 } });
  const close = interpolate(frame, [CLICK_SELECT, CLICK_SELECT + 8], [0, 1], clamp);
  let highlight = -1;
  for (const [f, i] of HOVERS) if (frame >= f) highlight = i;
  return {
    ...INITIAL,
    builder,
    dropdown: open * (1 - close),
    highlight,
    preset: frame >= CLICK_SELECT ? SELECTED_PRESET : null,
    fill: interpolate(frame, [CLICK_SELECT + 4, CLICK_SELECT + 32], [0, 1], clamp),
    sections: Math.floor(interpolate(frame, [CLICK_SELECT + 32, CLICK_SELECT + 54], [0, FORM.sections.length], clamp)),
    press: interpolate(frame, [CLICK_GENERATE, CLICK_GENERATE + 3, CLICK_GENERATE + 9], [0, 1, 0], clamp),
    generated: frame >= CLICK_GENERATE + 4 ? frame - CLICK_GENERATE - 4 : -1,
  };
};

/** Scene 3 (501–884): the builder in action — modes, preset dropdown, Generate, instant instructions. */
export const Scene3Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { band, vp } = useDemoFrame();
  const cam = camera(frame, vp.w, vp.h, band === null);
  const caption = [...CAPTIONS].reverse().find(([at]) => frame >= at) ?? CAPTIONS[0];
  const cur = cursorAt(frame);
  const lastClick = Math.max(...CLICKS.filter((c) => frame >= c), -999);
  const press = interpolate(frame - lastClick, [0, 3, 8], [0, 1, 0], clamp);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.canvas }}>
      {band && (
        <div style={{ position: "absolute", left: 60, right: 60, top: band.y, height: band.h, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RevealText key={caption[1]} text={caption[1]} delay={caption[0] + 2} accent={caption[2]} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: band.fs, lineHeight: 1.08, color: C.cream, textAlign: "center" }} />
        </div>
      )}
      <div style={{ position: "absolute", left: vp.x, top: vp.y, width: vp.w, height: vp.h, overflow: "hidden", borderRadius: band ? 28 : 0, boxShadow: band ? "0 30px 80px rgba(0,0,0,0.5)" : undefined }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", scale: `${cam.s}`, translate: `${cam.tx}px ${cam.ty}px` }}>
        <ActionSuiteLayout state={demoState(frame, fps)} />
        {CLICKS.map((c) => (
          <ClickRipple key={c} x={cursorAt(c).x} y={cursorAt(c).y} t={frame - c} color={c === CLICK_GENERATE ? "#687323" : "#D5FA00"} />
        ))}
        <Cursor x={cur.x} y={cur.y} press={press} opacity={interpolate(frame, [14, 22, 356, 370], [0, 1, 1, 0], clamp)} />
      </div>
      </div>
    </AbsoluteFill>
  );
};
