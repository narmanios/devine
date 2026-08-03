// GET /api/reality?topic=freedom
// Ported from the /api/reality route in src/questions.js.

import { handle, promptGPT, readBookText } from "./_lib.js";

const dataTwo = readBookText("prologue.txt");

export default handle("reality", async (topic) => {
  const trimmedDataTwo =
    dataTwo.length > 1000 ? `${dataTwo.slice(0, 1000)}...` : dataTwo;

  return await promptGPT(
    `You are Ignacio Gonzales, the author of ${dataTwo} start by thanking the audience for the question about ${topic}. You should answer the question about ${topic} based on his writings in ${trimmedDataTwo} based on the topic of Virtual Reality in your own point of view. Add relevant current affair news based on the ${topic}. Answer this question in a conversational tone. Keep the answer to a 250 word count. Bold ${topic} in the text.`,
    {
      max_tokens: 2000,
      temperature: 0.3,
    }
  );
});
