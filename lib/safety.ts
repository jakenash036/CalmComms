const RISK_TERMS = [
  "self-harm",
  "suicide",
  "abuse",
  "neglect",
  "disclosure",
  "disclosed",
  "injury",
  "medical emergency",
  "police",
  "weapon",
  "knife",
  "sexual",
  "assault",
  "bruises",
  "blood",
  "threat to life",
  "safeguarding",
  "dsl",
];

export const SAFETY_BLOCK_MESSAGE =
  "This note may involve safeguarding, medical, legal, or serious risk information. CalmComms should not be used to process this content. Please follow your school policy and speak to the DSL or relevant senior leader.";

export function hasRiskKeywords(input: string): boolean {
  const normalisedInput = input.toLowerCase();
  return RISK_TERMS.some((term) => normalisedInput.includes(term));
}
