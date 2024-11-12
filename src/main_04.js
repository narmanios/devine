// This version uses a static file server for unknown routes.

// Try this with
// http://localhost:8000/
// http://localhost:8000/api/test?myParam=abc

// Import the the Application and Router classes from the Oak module
import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

// Import the createExitSignal function from the JS+OAI shared library
import { createExitSignal, staticServer } from "./shared/server.ts";

// Create an instance of the Application and Router classes
const app = new Application();
const router = new Router();

// Configure a custom route
// This function will run when "/api/color" is requested
router.get("/api/appendix", (ctx) => {
  console.log("someone made a request to /api/appendix");

  // output some info about the request
  console.log("ctx.request.url.pathname:", ctx.request.url.pathname);
  console.log("myParam:", ctx.request.url.searchParams.get("myParam"));
  console.log("ctx.request.method:", ctx.request.method);

  // send a response back to the browser

  document
    .querySelector("#get-appendix")
    .addEventListener("click", async () => {
      // Get the selected value from the dropdown
      const dropdown = document.querySelector("#topic-appendix");
      const selectedTopic = dropdown.value;

      // Update the output with a loading message
      const outputDiv = document.querySelector("#output-appendix");
      outputDiv.textContent = "Loading...";

      try {
        // Send a request to the backend API
        const response = await fetch(
          `/api/appendix?topic=${encodeURIComponent(selectedTopic)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const artist = await response.text();

        // Display the result
        outputDiv.textContent = appendix;
      } catch (err) {
        console.error("Error fetching appendix data:", err.message);
        outputDiv.textContent = "An error occurred while fetching the data.";
      }
    });

  const randomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Usage
  ctx.response.body = randomColor();
});

// This function will run when "/api/dice" is requested
router.get("/api/d6", (ctx) => {
  console.log("someone made a request to /api/d6");

  // output some info about the request
  console.log("ctx.request.url.pathname:", ctx.request.url.pathname);
  console.log("myParam:", ctx.request.url.searchParams.get("myParam"));
  console.log("ctx.request.method:", ctx.request.method);

  // send a response back to the browser
  const randomNum = Math.floor(Math.random() * 6) + 1;

  ctx.response.body = randomNum;
});

// Tell the app to use the router
app.use(router.routes());
app.use(router.allowedMethods());

// Try serving undefined routes with static files
app.use(staticServer);

// Everything is set up, let's start the server
console.log("\nListening on http://localhost:8000");
await app.listen({ port: 8000, signal: createExitSignal() });
