import { type ComponentType, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const WORDS_PER_MINUTE = 200;

export function readingTimeMinutes(
  text: string,
  wordsPerMinute = WORDS_PER_MINUTE,
): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function textFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .replace(/ ([.,;:!?])/g, "$1")
    .trim();
}

export function readingTimeMinutesFromComponent(
  Component: ComponentType,
): number {
  const html = renderToStaticMarkup(createElement(Component));
  return readingTimeMinutes(textFromHtml(html));
}
