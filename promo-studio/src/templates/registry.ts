// Bespoke templates: one-off designs that don't use the AppPromo brief fields.
// A project uses one by setting `"template": "<Name>"` in its brief.json; it then renders,
// versions and delivers like any other project (`npm run render -- <slug>` → 20_RENDERS).
//
// To add one: build it in src/templates/<Name>/, export the component + its length in frames,
// and add an entry here. The key is the exact "template" value used in brief.json.
import type React from "react";
import { ACTION_SUITE_DURATION, ActionSuitePromo } from "./ActionSuitePipeline/Composition";
import { ACTION_SUITE_X24H_DURATION, ActionSuiteX24HPromo } from "./ActionSuiteX24H/Composition";

export type CustomTemplate = {
  component: React.FC;
  durationInFrames: number;
};

export const CUSTOM_TEMPLATES: Record<string, CustomTemplate> = {
  ActionSuiteX24H: { component: ActionSuiteX24HPromo, durationInFrames: ACTION_SUITE_X24H_DURATION },
  ActionSuitePipeline: { component: ActionSuitePromo, durationInFrames: ACTION_SUITE_DURATION },
};
