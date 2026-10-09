import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { BUILDERS, FORM, INSTRUCTIONS, LOGO, NAV, PRESETS, USER, type Builder } from "../content";
import { C, clamp, FONT } from "../tokens";
import { BotcakeLogo, Chip } from "../ui";

/**
 * Everything that changes in the app mock. Scenes compute this from the frame; the layout is pure.
 * Counts/progress are plain numbers so scenes can drive them with interpolate()/spring().
 */
export type LayoutState = {
  builder: Builder;
  dropdown: number; // 0 closed → 1 open
  highlight: number; // hovered preset index, -1 = none
  preset: number | null; // selected preset index
  fill: number; // 0→1 autofill of business name + description
  sections: number; // how many Role/Tone/… tabs are switched on
  press: number; // Generate button press 0→1
  generated: number; // frames since Generate (−1 = not yet) — drives the preview fill
  validate: number; // Validate on ChatGPT glow 0→1
  validateRipple: number; // frames since the validate ripple started (−1 = none)
};

export const INITIAL: LayoutState = { builder: "Product", dropdown: 0, highlight: -1, preset: null, fill: 0, sections: 0, press: 0, generated: -1, validate: 0, validateRipple: -1 };

// Geometry on the 1920×1080 canvas — exported so scenes can aim the camera and the cursor.
export const GEO = {
  sidebar: { w: 300 },
  builderTab: (b: Builder) => ({ x: 70, y: 436 + BUILDERS.indexOf(b) * 48 }), // centre-left of the submenu row
  form: { x: 340, y: 120, w: 780, h: 920 },
  presetField: { x: 376, y: 352, w: 708, h: 64 },
  presetItem: (i: number) => ({ x: 376, y: 424 + i * 58, w: 708, h: 58 }),
  generate: { x: 376, y: 944, w: 708, h: 72 },
  preview: { x: 1160, y: 120, w: 720, h: 920 },
  validate: { x: 1490, y: 954, w: 354, h: 64 },
};
export const centre = (r: { x: number; y: number; w?: number; h?: number }) => ({ x: r.x + (r.w ?? 0) / 2, y: r.y + (r.h ?? 0) / 2 });

const label = (text: string, dark = false) => (
  <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 15, letterSpacing: 1.6, color: dark ? "rgba(246,241,230,0.45)" : C.inkMuted, marginBottom: 10 }}>{text}</div>
);

const Sidebar: React.FC<{ s: LayoutState }> = ({ s }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: GEO.sidebar.w, height: 1080, background: C.canvas, padding: "30px 22px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44 }}>
      <Img src={staticFile(LOGO)} style={{ width: 44, height: 44, borderRadius: 10 }} />
      <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 24, color: C.cream }}>ActionSuite</div>
    </div>
    {label("WORKSPACE", true)}
    {NAV.map((n) => (
      <div key={n} style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 19, color: C.muted, padding: "14px 14px", borderRadius: 12 }}>
        {n}
      </div>
    ))}
    {/* Agent Builder — the active, expanded item */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT.body, fontWeight: 600, fontSize: 19, color: C.ink, background: C.lime, padding: "14px 14px", borderRadius: 12, marginTop: 4 }}>
      Agent Builder <span style={{ fontSize: 14 }}>▾</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8, paddingLeft: 18, borderLeft: `2px solid ${C.olive}`, marginLeft: 16 }}>
      {BUILDERS.map((b) => {
        const on = s.builder === b;
        return (
          <div key={b} style={{ height: 44, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.body, fontWeight: on ? 600 : 500, fontSize: 18, color: on ? C.lime : C.muted, background: on ? "rgba(213,250,0,0.10)" : "transparent", borderRadius: 10, padding: "0 12px" }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: on ? C.lime : C.border }} />
            {b}
          </div>
        );
      })}
    </div>
    <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 19, color: C.muted, padding: "14px 14px", marginTop: 8 }}>Settings</div>
    <div style={{ flex: 1 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.panel, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "14px 16px" }}>
      <div style={{ width: 42, height: 42, borderRadius: 99, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.body, fontWeight: 600, fontSize: 17, color: C.ink }}>{USER.initials}</div>
      <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 17, color: C.cream, flex: 1 }}>{USER.name}</div>
      <Chip tone="lime" size={14}>
        {USER.plan}
      </Chip>
    </div>
  </div>
);

const Field: React.FC<{ children: React.ReactNode; h: number; active?: boolean; style?: React.CSSProperties }> = ({ children, h, active, style }) => (
  <div
    style={{
      height: h,
      background: C.white,
      border: `2px solid ${active ? C.olive : C.line}`,
      borderRadius: 14,
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      fontFamily: FONT.body,
      fontWeight: 500,
      fontSize: 20,
      color: C.ink,
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

const FormCard: React.FC<{ s: LayoutState }> = ({ s }) => {
  const desc = Array.from(FORM.description);
  const preset = s.preset === null ? null : PRESETS[s.preset];
  return (
    <div style={{ position: "absolute", left: GEO.form.x, top: GEO.form.y, width: GEO.form.w, height: GEO.form.h, background: C.white, borderRadius: 26, boxShadow: "0 20px 50px rgba(39,35,27,0.10)", padding: 36, boxSizing: "border-box" }}>
      <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 30, color: C.ink }}>Build your Botcake agent</div>
      <div style={{ fontFamily: FONT.body, fontWeight: 400, fontSize: 18, color: C.inkMuted, marginTop: 6 }}>Pick a builder and preset — we structure the rest.</div>

      {/* Builder segmented control */}
      <div style={{ display: "flex", background: C.cream, borderRadius: 14, padding: 5, marginTop: 22, gap: 4 }}>
        {BUILDERS.map((b) => (
          <div key={b} style={{ flex: 1, height: 46, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.body, fontWeight: 600, fontSize: 18, color: s.builder === b ? C.cream : C.inkMuted, background: s.builder === b ? C.canvas : "transparent" }}>
            {b} Builder
          </div>
        ))}
      </div>

      {/* Preset (dropdown overlays the fields below) */}
      <div style={{ position: "absolute", left: GEO.presetField.x - GEO.form.x, top: GEO.presetField.y - GEO.form.y - 30, width: GEO.presetField.w }}>
        {label("INDUSTRY PRESET")}
      </div>
      <div style={{ position: "absolute", left: GEO.presetField.x - GEO.form.x, top: GEO.presetField.y - GEO.form.y, width: GEO.presetField.w, zIndex: 5 }}>
        <Field h={GEO.presetField.h} active={s.dropdown > 0.5}>
          {preset ? (
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {preset.name} <Chip size={14}>{preset.builder}</Chip>
            </span>
          ) : (
            <span style={{ color: "#A39B8B" }}>Choose an industry preset…</span>
          )}
          <span style={{ marginLeft: "auto", color: C.inkMuted, rotate: `${s.dropdown * 180}deg`, display: "inline-block" }}>▾</span>
        </Field>
        {s.dropdown > 0.01 && (
          <div style={{ marginTop: 6, background: C.white, border: `2px solid ${C.line}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 50px rgba(39,35,27,0.18)", height: PRESETS.length * 58 * s.dropdown, opacity: Math.min(1, s.dropdown * 2) }}>
            {PRESETS.map((p, i) => (
              <div key={p.name} style={{ height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", fontFamily: FONT.body, fontWeight: 500, fontSize: 20, color: C.ink, background: s.highlight === i ? "rgba(213,250,0,0.35)" : "transparent", borderBottom: `1px solid ${C.line}` }}>
                {p.name}
                <span style={{ marginLeft: "auto" }}>
                  <Chip size={14}>{p.builder}</Chip>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: 36, right: 36, top: 448 - GEO.form.y }}>
        {label("BUSINESS NAME")}
        <Field h={60}>{FORM.business.slice(0, Math.round(FORM.business.length * Math.min(1, s.fill * 2)))}</Field>
        <div style={{ height: 22 }} />
        {label("WHAT YOU SELL & WHO YOU SERVE")}
        <Field h={140} style={{ alignItems: "flex-start", paddingTop: 16, lineHeight: 1.45, fontSize: 19 }}>
          {desc.slice(0, Math.round(desc.length * Math.max(0, s.fill * 2 - 1))).join("")}
        </Field>
        <div style={{ height: 22 }} />
        {label("STRUCTURE")}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {FORM.sections.map((sec, i) => {
            const on = i < s.sections;
            return (
              <div key={sec} style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 18, padding: "10px 18px", borderRadius: 999, border: `2px solid ${on ? C.olive : C.line}`, background: on ? C.blue : C.white, color: on ? C.ink : C.inkMuted }}>
                {on ? "✓ " : ""}
                {sec}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate prompt */}
      <div
        style={{
          position: "absolute",
          left: GEO.generate.x - GEO.form.x,
          top: GEO.generate.y - GEO.form.y,
          width: GEO.generate.w,
          height: GEO.generate.h,
          borderRadius: 16,
          background: C.lime,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 24,
          color: C.ink,
          scale: `${1 - 0.04 * s.press}`,
          boxShadow: `0 ${10 - 8 * s.press}px ${28 - 18 * s.press}px rgba(104,115,35,0.35)`,
        }}
      >
        ✦ Generate prompt
      </div>
    </div>
  );
};

const Preview: React.FC<{ s: LayoutState }> = ({ s }) => {
  const ready = s.generated >= 0;
  let row = 0;
  return (
    <div style={{ position: "absolute", left: GEO.preview.x, top: GEO.preview.y, width: GEO.preview.w, height: GEO.preview.h, background: C.white, borderRadius: 26, boxShadow: "0 20px 50px rgba(39,35,27,0.10)", border: `2px solid ${ready ? C.lime : "transparent"}`, boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "26px 30px", borderBottom: `2px solid ${C.line}` }}>
        <span style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 24, color: C.ink }}>Your</span>
        <BotcakeLogo h={28} />
        <span style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 24, color: C.ink }}>instructions</span>
        <span style={{ marginLeft: "auto" }}>
          <Chip tone={ready ? "lime" : "blue"} size={15}>
            {ready ? "✓ Generated" : "Waiting"}
          </Chip>
        </span>
      </div>
      <div style={{ flex: 1, padding: "24px 30px", background: "#FBF9F4", fontFamily: FONT.mono, fontWeight: 500, fontSize: 18, lineHeight: 1.55, color: C.ink, overflow: "hidden" }}>
        {!ready && <div style={{ color: "#A39B8B" }}>Your structured system instructions will appear here.</div>}
        {ready &&
          INSTRUCTIONS.map((sec) => {
            const at = row++ * 5; // sections land 5 frames apart — "instantly"
            const p = interpolate(s.generated, [at, at + 6], [0, 1], clamp);
            return (
              <div key={sec.heading} style={{ marginBottom: 16, opacity: p, translate: `0px ${(1 - p) * 12}px` }}>
                <div style={{ color: C.olive, fontWeight: 600 }}>## {sec.heading}</div>
                {sec.lines.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            );
          })}
      </div>
      <div style={{ display: "flex", gap: 14, padding: "18px 30px 20px", justifyContent: "flex-end", alignItems: "center", position: "relative" }}>
        <div style={{ height: 64, padding: "0 26px", borderRadius: 14, border: `2px solid ${C.line}`, display: "flex", alignItems: "center", fontFamily: FONT.body, fontWeight: 600, fontSize: 19, color: C.inkMuted }}>Copy</div>
        <div
          style={{
            width: GEO.validate.w,
            height: GEO.validate.h,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 20,
            color: s.validate > 0.5 ? C.ink : C.cream,
            background: s.validate > 0.5 ? C.lime : C.canvas,
            boxShadow: `0 0 ${40 * s.validate}px rgba(213,250,0,${0.6 * s.validate})`,
            position: "relative",
          }}
        >
          ✓ Validate on ChatGPT
          {s.validateRipple >= 0 &&
            [0, 12, 24].map((d) => {
              const t = s.validateRipple - d;
              if (t < 0 || t > 30) return null;
              const p = t / 30;
              return <div key={d} style={{ position: "absolute", inset: -p * 26, borderRadius: 14 + p * 20, border: `3px solid ${C.olive}`, opacity: 1 - p }} />;
            })}
        </div>
      </div>
    </div>
  );
};

/** The ActionSuite web app: dark sidebar, cream workspace, builder form and instructions preview. */
export const ActionSuiteLayout: React.FC<{ state: LayoutState }> = ({ state }) => (
  <div style={{ position: "absolute", inset: 0, background: C.cream }}>
    <Sidebar s={state} />
    <div style={{ position: "absolute", left: GEO.sidebar.w, right: 0, top: 0, height: 88, display: "flex", alignItems: "center", padding: "0 40px", borderBottom: `2px solid ${C.line}`, gap: 12 }}>
      <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 19, color: C.inkMuted }}>Action Suite Workspace /</span>
      <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 19, color: C.ink }}>Botcake {state.builder === "Services" ? "Service" : state.builder} Builder</span>
      <span style={{ marginLeft: "auto" }}>
        <Chip tone="lime" size={15}>
          ★ PRO
        </Chip>
      </span>
    </div>
    <FormCard s={state} />
    <Preview s={state} />
  </div>
);
