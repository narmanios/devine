// GET /api/interview?topic=abundance
// Ported from the /api/interview route in src/questions.js.

import { handle, promptGPT, readBookText } from "./_lib.js";

const dataThree = readBookText("full-text.txt");

export default handle("interview", async (topic) => {
  return await promptGPT(
    `Write a script of a moderator speaking. The moderator should speak to the audience and answer ${topic} based on ${dataThree} in relation to book Beyond the Divine by Ignacio Gonzalez. Add relevant current affair news based on the ${topic}. Write this in a conversational tone in a interview script format. The person answering the questions is Igancio. Bold ${topic} in the script.`,
    {
      max_tokens: 2000,
      temperature: 0.3,
    }
  );
});
