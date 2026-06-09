export const MESSAGE_TYPES = [
  "Behaviour update",
  "Incident follow-up",
  "Positive update",
  "Attendance concern",
  "Learning update",
  "Meeting request",
  "General parent message",
] as const;

export const TONES = [
  "Warm",
  "Neutral",
  "Firm but polite",
  "Reassuring",
  "Concise",
] as const;

export const OUTPUT_TYPES = [
  "Parent-friendly version",
  "Internal record version",
  "Both",
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];
export type Tone = (typeof TONES)[number];
export type OutputType = (typeof OUTPUT_TYPES)[number];

export type RewriteInput = {
  input: string;
  messageType: string;
  tone: string;
  outputType: string;
};

export function validateRewriteInput(payload: RewriteInput): string | null {
  const input = payload.input?.trim();

  if (!input) {
    return "Rough staff note is required.";
  }

  if (input.length < 10) {
    return "Rough staff note must be at least 10 characters.";
  }

  if (input.length > 2500) {
    return "Rough staff note must be 2500 characters or fewer.";
  }

  if (!MESSAGE_TYPES.includes(payload.messageType as MessageType)) {
    return "Please select a valid message type.";
  }

  if (!TONES.includes(payload.tone as Tone)) {
    return "Please select a valid tone.";
  }

  if (!OUTPUT_TYPES.includes(payload.outputType as OutputType)) {
    return "Please select a valid output type.";
  }

  return null;
}
