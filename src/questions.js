// Simple Deno backend with a static server and a custom route that
// uses the OpenAI API to answers to questions based on RAG.

import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

import { createExitSignal, staticServer } from "./shared/server.ts";

import { promptGPT } from "./shared/openai.ts";

const app = new Application();
const router = new Router();

const dataOne = await Deno.readTextFile(`public/text/appendix.txt`);
const dataTwo = await Deno.readTextFile(`public/text/prologue.txt`);
const dataThree = await Deno.readTextFile(`public/text/full-text.txt`);

router.get("/api/appendix", async (ctx) => {
  // Get query parameter from the request
  const value = ctx.request.url.searchParams.get("topic");

  // Log the request
  console.log("Someone made a request to /api/appendix:", value);

  if (!value) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Topic parameter is missing." };
    return;
  }
  const trimmedData =
    dataOne.length > 1000 ? `${dataOne.slice(0, 1000)}...` : dataOne;

  try {
    // Use promptGPT to generate the response
    const appendix = await promptGPT(
      `You are Ignacio Gonzales, the author of ${dataOne} start by thanking the audience for the question about ${value}. Then you should answer the question about ${value} based on the writings in ${trimmedData} and the topic of the Universe in your own point of view. Answer this question in a conversational tone as if you are Ignacio Gonzalez. Keep the answer to a 250 word count. Bold ${value} in the text.`,
      {
        max_tokens: 1000,
        temperature: 0.3,
      }
    );

    // Send the response back to the client
    ctx.response.status = 200;
    ctx.response.body = appendix;
  } catch (err) {
    console.error("Error generating appendix data:", err.message);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error." };
  }
});

router.get("/api/reality", async (ctx) => {
  // ?
  const topic = ctx.request.url.searchParams.get("topic");

  // ?
  console.log("someone made a request to /api/reality", topic);

  if (!topic) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Topic parameter is missing." };
    return;
  }
  const trimmedDataTwo =
    dataTwo.length > 1000 ? `${dataTwo.slice(0, 1000)}...` : dataTwo;

  const reality = await promptGPT(
    `You are Ignacio Gonzales, the author of ${dataTwo} start by thanking the audience for the question about ${topic}. You should answer the question about ${topic} based on his writings in ${trimmedDataTwo} based on the topic of Virtual Reality in your own point of view. Answer this question in a conversational tone. Keep the answer to a 250 word count. Bold ${topic} in the text.`,
    {
      max_tokens: 2000,
      temperature: 0.3,
    }
  );

  ctx.response.body = reality;
});

router.get("/api/interview", async (ctx) => {
  // ?
  const topic = ctx.request.url.searchParams.get("topic");

  // ?
  console.log("someone made a request to /api/interview", topic);

  const interview = await promptGPT(
    `Write a script of a moderator speaking. The moderator should speak to the audience and answer ${topic} based on ${dataThree} in relation to book Beyond the Divine by Ignacio Gonzalez. Write this in a conversational tone in a interview script format. The person answering the questions is Igancio. Bold ${topic} in the script.`,
    {
      max_tokens: 2000,
      temperature: 0.3,
    }
  );

  ctx.response.body = interview;

  // const outputDiv = document.querySelector("#output-artist");
  // outputDiv.textContent = responseText;
});

//   const interview = await promptGPT(
//     `You create cards for a moderator where they ask questions about ${topic} based on ${dataThree} to Ignacio Gonzalez.
//     Cards contain...
//     title: a brief, punchy title. less than six words
//     question: the question based on ${topic} being asked
//     answer: Ignacio Gonzalez' answer

//     Create a JSON object of 5 cards for each question related to the given prompt.

//     {
//       cards: [
//         {
//           "title": "Beauty",
//           "question": "What is the purpose of beauty",
//           "answer": "Beauty, in its abstract form, is a cultural marker that has played a crucial role in our evolution."
//         },
//         {
//           "title": "Biology",
//           "question": "Why do we need Biology",
//           "answer": "The journey from chemistry to biology marks a significant transition. It begins with the formation of complex organic compounds, like proteins and nucleic acids, which are capable of storing and processing information. "
//         },
//         // Add more cards here
//       ]
//     }

// `,
//     {
//       model: "gpt-3.5-turbo",
//       response_format: { type: "json_object" },
//       max_tokens: 256,
//     }
//   );
//   // log.info(interview);
//   ctx.response.body = interview;
// });

// /// API For Art Generation
// router.get("/api/art", async (ctx) => {
//   const prompt = ctx.request.url.searchParams.get("prompt");
//   const stylePrompt = "retro comic book illustration";

//   const result = await fal.subscribe("fal-ai/fast-lightning-sdxl", {
//     input: {
//       prompt: `${prompt}, ${stylePrompt}`,
//       image_size: "square_hd",
//       num_inference_steps: "4",
//       num_images: 1,
//       enable_safety_checker: true,
//     },
//     logs: false,
//   });

//   ctx.response.body = result.images[0].url;
// });
// ?
app.use(router.routes());
app.use(router.allowedMethods());

// ?
app.use(staticServer);

// ?
console.log("\nListening on http://localhost:8000");
await app.listen({ port: 8000, signal: createExitSignal() });
