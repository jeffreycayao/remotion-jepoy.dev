import brief from "../../../projects/automatika-fast-ad/brief.json";

export type FastAdPain = {
  label: string;
  detail: string;
};

export type FastAdPillar = {
  name: string;
  detail: string;
  logo: string;
};

export type FastAdContent = {
  campaign?: string;
  voiceoverAsset: string;
  logoAsset: string;
  markAsset: string;
  partnerBadge: string;
  engineHeadline?: string;
  trainingLine?: string;
  hookBadge: string;
  hookQuestion: string;
  pains: FastAdPain[];
  pillars: FastAdPillar[];
  statusBadges: string[];
  cta: {
    headline: string;
    comment: string;
    booking: string;
    url: string;
  };
  illustrativeNote: string;
};

/** Project copy and asset paths live in the brief, not in the template. */
export const CONTENT = brief.props as unknown as FastAdContent;
