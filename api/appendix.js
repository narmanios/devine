// GET /api/appendix?topic=logic
// Ported from the /api/appendix route in src/questions.js.

import { handle, promptGPT, readBookText } from "./_lib.js";

const dataOne = readBookText("appendix.txt");

export default handle("appendix", async (value) => {
  const trimmedDataOne =
    dataOne.length > 1000 ? `${dataOne.slice(0, 1000)}...` : dataOne;

  return await promptGPT(
    `You are Ignacio Gonzales, the author of ${dataOne} start by thanking the audience for the question about ${value}. Then you should answer the question about ${value} based on the writings in ${trimmedDataOne} and the topic of the Universe in your own point of view. Answer this question in a conversational tone as if you are Ignacio Gonzalez. Keep the answer to a 250 word count. Bold ${value} in the text.`,
    {
      max_tokens: 1000,
      temperature: 0.3,
    }
  );
});
