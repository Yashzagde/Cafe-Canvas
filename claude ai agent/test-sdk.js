const { query } = require("@anthropic-ai/claude-agent-sdk");

async function main() {
  console.log("Starting SDK query...");
  try {
    for await (const message of query({
      prompt: "State your name and version.",
      options: {
        maxTurns: 2,
        allowedTools: ["Read"]
      }
    })) {
      if (message.type === "assistant") {
        console.log("\nAssistant:", JSON.stringify(message.message?.content));
      } else if (message.type === "system") {
        console.log("System:", message.subtype, message.data || "");
      } else if ("result" in message) {
        console.log("\nResult:", message.result);
      }
    }
  } catch (error) {
    console.error("Error running query:", error);
  }
}

main();
