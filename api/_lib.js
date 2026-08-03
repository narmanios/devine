// Shared helpers for the /api routes.
//
// This replaces the Deno + oak server that used to live in src/questions.js.
// GitHub Pages could not run that server, so each route is now a serverless
// function. The OpenAI key stays in process.env and is never sent to the
// browser.

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

// Cap the topic so a single request cannot balloon the prompt.
const MAX_TOPIC_LENGTH = 200;

// Book text is read from disk once per warm function instance.
const textCache = new Map();

/**
 * Reads a file out of docs/text/ and caches it for the life of the instance.
 * @param {string} name File name, e.g. "appendix.txt".
 * @returns {string} The file contents.
 */
export function readBookText(name) {
  if (textCache.has(name)) return textCache.get(name);

  // process.cwd() is the project root on Vercel, but fall back to a couple of
  // sensible spots so this also works when run locally from another directory.
  const candidates = [
    path.join(process.cwd(), "docs", "text", name),
    path.join(process.cwd(), "text", name),
    new URL(`../docs/text/${name}`, import.meta.url).pathname,
  ];

  for (const candidate of candidates) {
    try {
      const contents = fs.readFileSync(candidate, "utf8");
      textCache.set(name, contents);
      return contents;
    } catch {
      // try the next candidate
    }
  }

  throw new Error(`Could not read docs/text/${name}`);
}

let client;

/**
 * Lazily builds the OpenAI client so a missing key surfaces as a clean error
 * rather than a crash at import time.
 */
function openai() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
    client = new OpenAI({ apiKey });
  }
  return client;
}

/**
 * Sends a single-message chat completion, mirroring promptGPT in
 * src/shared/openai.ts so the prompts behave the way they always have.
 * @param {string} prompt
 * @param {object} params Overrides such as max_tokens and temperature.
 * @returns {Promise<string>} The trimmed reply text.
 */
export async function promptGPT(prompt, params = {}) {
  const response = await openai().chat.completions.create({
    model: "gpt-4o-2024-08-06",
    max_tokens: 128,
    ...params,
    messages: [{ role: "user", content: prompt }],
  });

  return (response.choices[0].message.content ?? "").trim();
}

/**
 * Wraps a route so every handler shares the same method check, topic
 * validation, and error handling.
 *
 * The browser reads these responses with response.text() and hands them to
 * marked.parse(), so errors are plain text too — a JSON blob would render as
 * literal JSON on the page.
 *
 * @param {string} label Name used in logs.
 * @param {(topic: string) => Promise<string>} generate Builds the reply.
 */
export function handle(label, generate) {
  return async function handler(request, response) {
    response.setHeader("content-type", "text/plain; charset=utf-8");

    if (request.method !== "GET") {
      response.status(405).send("Method not allowed.");
      return;
    }

    const topic = (request.query.topic ?? "").toString().trim();

    console.log(`Someone made a request to /api/${label}:`, topic);

    if (!topic) {
      response.status(400).send("Topic parameter is missing.");
      return;
    }

    if (topic.length > MAX_TOPIC_LENGTH) {
      response
        .status(400)
        .send(`Please keep the topic under ${MAX_TOPIC_LENGTH} characters.`);
      return;
    }

    try {
      const text = await generate(topic);
      response.status(200).send(text);
    } catch (error) {
      console.error(`Error generating ${label}:`, error);
      response.status(500).send("Sorry — something went wrong. Please try again.");
    }
  };
}
