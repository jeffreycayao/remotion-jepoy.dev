import { Composition, Folder } from "remotion";
import { FORMATS, FPS } from "./lib/layout";
import { PROJECTS, type Voiceover } from "./projects.generated";
import { AppPromo, calculateAppPromoMetadata } from "./templates/AppPromo/AppPromo";
import { appPromoSchema, type AppPromoProps } from "./templates/AppPromo/schema";
import { CUSTOM_TEMPLATES } from "./templates/registry";

/** One caption line per scene from voiceover.json — only if it still matches the brief's scenes. */
const voiceoverLines = (slug: string, props: AppPromoProps, vo: Voiceover | undefined, enabled = true) => {
  if (!vo || !enabled) return undefined;
  const sceneCount = 2 + props.features.length + (props.stats.length ? 1 : 0);
  const order = vo.scenes?.map((s) => s.scene) ?? vo.lines.map((l) => l.scene);
  if (order.length !== sceneCount) {
    console.warn(`[promo-studio] "${slug}": voiceover.json was written for ${order.length} scenes, the brief now has ${sceneCount} — captions off until you re-run the voiceover.`);
    return undefined;
  }
  return order.map((scene) => vo.lines.find((l) => l.scene === scene)?.text ?? "");
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* One composition per project × format, generated from projects/<slug>/brief.json.
          Edit the brief.json — Studio hot-reloads. Run `npm run sync` after adding a project. */}
      <Folder name="Projects">
        {PROJECTS.map(({ slug, brief, voiceover }) => {
          // Bespoke template (src/templates/registry.ts): same ids/formats, so render/deliver work unchanged.
          if (brief.template && brief.template !== "AppPromo") {
            const custom = CUSTOM_TEMPLATES[brief.template];
            if (!custom) {
              console.warn(`[promo-studio] Skipping project "${slug}": unknown template "${brief.template}" — add it to src/templates/registry.ts.`);
              return null;
            }
            return (
              <Folder key={slug} name={slug}>
                {(Array.isArray(brief.formats) ? brief.formats : []).filter((f) => f in FORMATS).map((fmt) => (
                  <Composition
                    key={fmt}
                    id={`${brief.compositionIdPrefix ?? slug}-${fmt}`}
                    component={custom.component}
                    durationInFrames={custom.durationInFrames}
                    fps={FPS}
                    width={FORMATS[fmt].width}
                    height={FORMATS[fmt].height}
                  />
                ))}
              </Folder>
            );
          }
          // One invalid brief must not take down Studio for every project: skip it and say why.
          const parsed = appPromoSchema.safeParse(brief.props);
          if (!parsed.success) {
            const issue = parsed.error.issues[0];
            console.warn(`[promo-studio] Skipping project "${slug}": brief.json props.${issue?.path.join(".")} — ${issue?.message}`);
            return null;
          }
          const props = { ...parsed.data, voiceoverLines: voiceoverLines(slug, parsed.data, voiceover, brief.captions !== false) };
          const formats = (Array.isArray(brief.formats) ? brief.formats : []).filter((f) => f in FORMATS);
          return (
            <Folder key={slug} name={slug}>
              {formats.map((fmt) => (
                <Composition
                  key={fmt}
                  id={`${slug}-${fmt}`}
                  component={AppPromo}
                  schema={appPromoSchema}
                  calculateMetadata={calculateAppPromoMetadata}
                  durationInFrames={300}
                  fps={FPS}
                  width={FORMATS[fmt].width}
                  height={FORMATS[fmt].height}
                  defaultProps={props}
                />
              ))}
            </Folder>
          );
        })}
      </Folder>


      {/* Sandbox for designing the template itself. Props edited in the sidebar save back here. */}
      <Folder name="Templates">
        <Composition
          id="AppPromo-Template"
          component={AppPromo}
          schema={appPromoSchema}
          calculateMetadata={calculateAppPromoMetadata}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            appName: "Taskly",
            tagline: "Your day, sorted.",
            logo: "",
            brand: {
              primary: "#7C5CFF",
              secondary: "#22D3EE",
              background: "#0B0B1A",
              text: "#FFFFFF",
              font: "Plus Jakarta Sans",
            },
            hook: {
              headline: "Stop drowning in to-dos",
              subheadline: "The planner that plans for you.",
            },
            features: [
              {
                title: "Smart scheduling",
                description: "Drop in tasks — Taskly finds the time.",
                icon: "📅",
                screenshot: "",
              },
              {
                title: "Focus mode",
                description: "Silence the noise and ship what matters.",
                icon: "🎯",
                screenshot: "",
              },
            ],
            stats: [
              { value: 4.9, prefix: "", suffix: "★", label: "App Store rating" },
              { value: 250, prefix: "", suffix: "K+", label: "Daily users" },
            ],
            cta: {
              headline: "Get your time back.",
              button: "Download free",
              url: "taskly.app",
            },
            audio: { music: "", volume: 0.6 },
            timing: {
              hookSeconds: 3,
              featureSeconds: 3.5,
              statsSeconds: 3,
              ctaSeconds: 3.5,
              transitionFrames: 15,
            },
          }}
        />
      </Folder>
    </>
  );
};
