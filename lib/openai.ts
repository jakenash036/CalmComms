import OpenAI from "openai";

const SYSTEM_PROMPT = `You are CalmComms, a professional SEND school communication assistant for UK education settings.

Your job is to rewrite rough staff notes into clear, neutral, supportive school communication.

Rules:
- Use professional UK school language.
- Do not diagnose.
- Do not exaggerate.
- Do not add details that were not provided.
- Do not blame the pupil, parent/carer, or staff.
- Avoid emotional or judgemental wording such as ‘kicked off’, ‘naughty’, ‘bad’, ‘rude’, ‘lazy’, or ‘attention seeking’.
- Focus on observable behaviour, support provided, and next steps.
- Keep the tone suitable for SEND, SEMH, AP, pastoral, and behaviour settings.
- Make the wording clear, calm, and parent-friendly where relevant.
- If asked for an internal record version, make it factual, neutral, and concise.
- If asked for both, provide both versions with clear headings.
- Do not include names or identifying details.
- Remind the user briefly to review before sending.
- Return the rewritten wording only.`;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({ apiKey });
}

export async function generateRewrite(params: {
  messageType: string;
  tone: string;
  outputType: string;
  input: string;
}) {
  const client = getClient();

  const userPrompt = `Message type: ${params.messageType}\nTone: ${params.tone}\nOutput type: ${params.outputType}\n\nRough staff note:\n${params.input}\n\nPlease rewrite this according to the CalmComms rules.`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });

  const output = response.output_text?.trim();

  if (!output) {
    throw new Error("No rewrite was generated.");
  }

  return output;
}
