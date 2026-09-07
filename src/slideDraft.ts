import { Slide } from "./types";

const MAX_SLIDES = 8;
const MAX_BODY_LINES = 5;

type SourceLine = {
  text: string;
  isBullet: boolean;
};

function cleanLine(line: string) {
  return line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim();
}

function titleFrom(text: string, fallbackIndex: number) {
  const cleaned = cleanLine(text).replace(/[:.]+$/, "");
  if (!cleaned) return `Key idea ${fallbackIndex}`;

  return cleaned.split(/\s+/).slice(0, 8).join(" ");
}

function slideFromGroup(group: string[], index: number): Slide {
  const [first, ...rest] = group;
  const bodyLines = (rest.length ? rest : [first]).slice(0, MAX_BODY_LINES);

  return {
    title: titleFrom(first, index),
    body: bodyLines.map((line) => `• ${line}`).join("\n"),
  };
}

function splitProse(lines: SourceLine[]): string[][] {
  const sentences = lines
    .map((line) => line.text)
    .join(" ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks: string[][] = [];
  for (let index = 0; index < sentences.length; index += MAX_BODY_LINES) {
    chunks.push(sentences.slice(index, index + MAX_BODY_LINES));
  }

  return chunks.length ? chunks : [lines.map((line) => line.text)];
}

/**
 * Creates a concise, editable deck locally. It recognizes section headings and
 * bullets, while long prose is split into readable multi-slide chunks.
 */
export function createInstantDraft(source: string): Slide[] {
  const lines: SourceLine[] = source
    .split(/\r?\n/)
    .map((line) => ({
      text: cleanLine(line),
      isBullet: /^\s*(?:[-*•]|\d+[.)])\s*/.test(line),
    }))
    .filter((line) => line.text);

  if (!lines.length) return [];

  const groups: string[][] = [];
  let current: string[] = [];
  let foundHeading = false;

  for (const line of lines) {
    const isHeading = !line.isBullet && (/[:：]$/.test(line.text) || /^#{1,6}\s+/.test(line.text));
    if (isHeading) {
      if (current.length) groups.push(current);
      current = [line.text.replace(/^#{1,6}\s+/, "")];
      foundHeading = true;
      continue;
    }

    current.push(line.text);
  }
  if (current.length) groups.push(current);

  const sourceGroups = foundHeading ? groups : splitProse(lines);
  return sourceGroups.slice(0, MAX_SLIDES).map((group, index) => slideFromGroup(group, index + 1));
}
