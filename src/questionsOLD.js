// src/main_05_joke.js
// Simple Deno backend with a static server and custom routes using the OpenAI API.

import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { createExitSignal, staticServer } from "./shared/server.ts";
import { promptGPT } from "./shared/openai.ts";

const app = new Application();
const router = new Router();

// Helper function to safely read files
async function readFileSafe(filePath) {
  try {
    const absolutePath = `${Deno.cwd()}/${filePath}`;
    return await Deno.readTextFile(absolutePath);
  } catch (err) {
    console.error(`Error reading file at ${filePath}:`, err.message);
    return null;
  }
}

// Artist Route
router.get("/api/artist", async (ctx) => {
  console.log("Someone made a request to /api/artist");

  const topic = ctx.request.url.searchParams.get("topic") || "general topic";

  console.log("Topic:", topic);

  // Safely read the file
  const dataOne = await readFileSafe("text/prologue.txt");
  if (!dataOne) {
    ctx.response.status = 404;
    ctx.response.body = { error: "File not found or cannot be read." };
    return;
  }

  console.log("File content:", dataOne);

  try {
    const artist = await promptGPT(
      `Tell me about ${topic} in relation to Jay Rodriguez, saxophonist and woodwinds musician.`,
      {
        max_tokens: 5000,
        temperature: 0.3,
      }
    );

    ctx.response.body = artist;
  } catch (err) {
    console.error("Error fetching data from GPT:", err.message);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to generate response from GPT." };
  }
});

// Festival Route
router.get("/api/festival", async (ctx) => {
  console.log("Someone made a request to /api/festival");

  const topic = ctx.request.url.searchParams.get("topic") || "general topic";

  console.log("Topic:", topic);

  // Safely read the file
  const dataOne = await readFileSafe("public/text/prologue.txt");
  if (!dataOne) {
    ctx.response.status = 404;
    ctx.response.body = { error: "File not found or cannot be read." };
    return;
  }

  try {
    const festival = await promptGPT(
      `Write a script of a moderator speaking. The moderator should speak to the audience and answer ${topic} based on ${dataOne} in relation to the book Beyond the Divine by Ignacio Gonzalez. Write this in a conversational tone.`,
      {
        max_tokens: 5000,
        temperature: 0.3,
      }
    );

    ctx.response.body = festival;
  } catch (err) {
    console.error("Error fetching data from GPT:", err.message);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to generate response from GPT." };
  }
});

// Middleware and Server Configuration
app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticServer);

console.log("\nListening on http://localhost:8000");
await app.listen({ port: 8000, signal: createExitSignal() });
