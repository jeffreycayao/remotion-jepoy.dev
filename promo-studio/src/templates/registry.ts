// Bespoke templates: one-off designs that don't use the AppPromo brief fields.
// A project uses one by setting `"template": "<Name>"` in its brief.json; it then renders,
// versions and delivers like any other project (`npm run render -- <slug>` → out/renders).
//
// To add one: build it in src/templates/<Name>/, export the component + its length in frames,
// and add an entry here. The key is the exact "template" value used in brief.json.
import type React from "react";
import { ACTION_SUITE_DURATION, ActionSuitePromo } from "./ActionSuitePipeline/Composition";
import { ACTION_SUITE_X24H_DURATION, ActionSuiteX24HPromo } from "./ActionSuiteX24H/Composition";
import { BOTCAKE_QA_DURATION, MainPromo as BotcakeQAPromo } from "./BotcakeQA/MainPromo";
import { AGENT_BUILDER_DURATION, MainAnnouncement as AgentBuilderAnnouncement } from "./AgentBuilder/MainAnnouncement";
import { MainCommercial as PancakePartnerCommercial, PANCAKE_PARTNER_DURATION } from "./PancakePartner/MainCommercial";
import { MainCommercial as PancakeEcosystemCommercial, PANCAKE_ECOSYSTEM_DURATION } from "./PancakeEcosystem/MainCommercial";
import { MainCommercial as PersonalAdCommercial, PERSONAL_AD_DURATION } from "./PersonalAd/MainCommercial";
import { MainCommercial as FastAdCommercial, FAST_AD_DURATION } from "./FastAd/MainCommercial";
import { MainWebinarPromo, WEBINAR_DURATION } from "./WebinarPromo/MainWebinarPromo";
import { MainSalesAd, SALES_AD_DURATION } from "./SalesAd/MainSalesAd";
import { GO_LIVE_FAST_DURATION, MainCommercial as GoLiveFastCommercial } from "./GoLiveFast/MainCommercial";

export type CustomTemplate = {
  component: React.FC;
  durationInFrames: number;
};

export const CUSTOM_TEMPLATES: Record<string, CustomTemplate> = {
  SalesAd: { component: MainSalesAd, durationInFrames: SALES_AD_DURATION },
  GoLiveFast: { component: GoLiveFastCommercial, durationInFrames: GO_LIVE_FAST_DURATION },
  WebinarPromo: { component: MainWebinarPromo, durationInFrames: WEBINAR_DURATION },
  PancakePartner: { component: PancakePartnerCommercial, durationInFrames: PANCAKE_PARTNER_DURATION },
  PancakeEcosystem: { component: PancakeEcosystemCommercial, durationInFrames: PANCAKE_ECOSYSTEM_DURATION },
  PersonalAd: { component: PersonalAdCommercial, durationInFrames: PERSONAL_AD_DURATION },
  FastAd: { component: FastAdCommercial, durationInFrames: FAST_AD_DURATION },
  AgentBuilder: { component: AgentBuilderAnnouncement, durationInFrames: AGENT_BUILDER_DURATION },
  BotcakeQA: { component: BotcakeQAPromo, durationInFrames: BOTCAKE_QA_DURATION },
  ActionSuiteX24H: { component: ActionSuiteX24HPromo, durationInFrames: ACTION_SUITE_X24H_DURATION },
  ActionSuitePipeline: { component: ActionSuitePromo, durationInFrames: ACTION_SUITE_DURATION },
};
