"use client";

import { useState } from "react";
import { MESSAGE_TYPES, OUTPUT_TYPES, TONES } from "@/lib/validation";

type RewriteResponse = {
  output: string;
  blocked?: boolean;
  usedThisMonth?: number;
};

type RewriteFormProps = {
  initialUsedThisMonth: number;
};

export function RewriteForm({ initialUsedThisMonth }: RewriteFormProps) {
  const [input, setInput] = useState("");
  const [messageType, setMessageType] = useState<string>(MESSAGE_TYPES[0]);
  const [tone, setTone] = useState<string>(TONES[1]);
  const [outputType, setOutputType] = useState<string>(OUTPUT_TYPES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [usedThisMonth, setUsedThisMonth] = useState(initialUsedThisMonth);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setOutput("");
    setCopied(false);

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          messageType,
          tone,
          outputType,
        }),
      });

      const data = (await response.json()) as RewriteResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setOutput(data.output);
      if (typeof data.usedThisMonth === "number") {
        setUsedThisMonth(data.usedThisMonth);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="input">
              Rough staff note
            </label>
            <textarea
              id="input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-44 w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
              placeholder="Paste rough staff notes here..."
              maxLength={2500}
            />
            <p className="mt-1 text-xs text-slate-500">{input.length} / 2500 characters</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Message type
              <select
                value={messageType}
                onChange={(event) => setMessageType(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800"
              >
                {MESSAGE_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Tone
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800"
              >
                {TONES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Output type
              <select
                value={outputType}
                onChange={(event) => setOutputType(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800"
              >
                {OUTPUT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Rewriting..." : "Rewrite"}
          </button>

          <p className="text-xs text-slate-500">Current usage this session: {usedThisMonth}</p>

          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Rewritten output</h2>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!output}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-4 min-h-64 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 whitespace-pre-wrap text-slate-800">
          {isLoading
            ? "Generating rewrite..."
            : output || "Your rewritten message will appear here."}
        </div>
      </div>
    </div>
  );
}
