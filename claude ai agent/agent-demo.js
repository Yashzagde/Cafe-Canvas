/**
 * Claude Agent SDK Multi-Agent Orchestration Demo
 * 
 * This script demonstrates:
 * 1. Defining specialized subagents (Security Analyzer & Performance Profiler)
 * 2. Allowing the parent agent to delegate tasks autonomously
 * 3. Handling streaming SDK events (Tool calls, subagent transitions, results)
 * 4. Beautiful console rendering using ANSI colors
 */

const { query } = require("@anthropic-ai/claude-agent-sdk");

// ANSI color escape codes for terminal formatting
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  bgBlue: "\x1b[44m\x1b[37m",
  bgMagenta: "\x1b[45m\x1b[37m"
};

// Help message explaining credentials
function printWelcomeBanner() {
  console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   CLAUDE AGENT SDK - MULTI-AGENT ORCHESTRATION DEMONSTRATION  ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}`);
  console.log(`This script runs an autonomous agent loop that defines subagents,`);
  console.log(`delegates security & performance audits, and rewrites code to fix bugs.`);
  console.log();
  console.log(`${colors.bright}${colors.yellow}Authentication Notice:${colors.reset}`);
  console.log(`To run this script, you must have one of the following set:`);
  console.log(` 1. The ANTHROPIC_API_KEY environment variable (Console API Key)`);
  console.log(` 2. Cloud provider variables (Bedrock, Vertex AI, Azure Foundry)`);
  console.log(` 3. Or have logged in via the global CLI (claude auth login)`);
  console.log(`${colors.dim}----------------------------------------------------------------${colors.reset}\n`);
}

async function main() {
  printWelcomeBanner();

  const prompt = "Use your specialized subagents to review utils.js. First, delegate a security analysis to the security-analyzer subagent, and a performance analysis to the performance-profiler subagent. After receiving their reports, combine their feedback to rewrite utils.js. Ensure you fix all bugs, secure the API keys, optimize the processing code, and document your edits.";

  const options = {
    // Enable the main agent to read, write, edit, and invoke subagents
    allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Agent"],
    // Automatically accept file edits to make the demo run smoothly
    permissionMode: "acceptEdits",
    
    // Define the subagents programmatically
    agents: {
      "security-analyzer": {
        description: "Specialized in finding security vulnerabilities, hardcoded secrets, weak algorithms, and input validation failures.",
        prompt: `You are an expert security researcher. Analyze the target code specifically for:
- Hardcoded api keys, passwords, or secrets.
- Input validation issues (e.g., missing checks, division by zero, null pointers).
- Safe data handling and secure design principles.
Provide a clear, bulleted report of security bugs found and how to fix them.`,
        tools: ["Read", "Grep", "Glob"],
        model: "sonnet"
      },
      "performance-profiler": {
        description: "Specialized in profiling code performance, detecting blocking operations, inefficient loops, and event loop delays.",
        prompt: `You are a performance optimization expert. Analyze the target code for:
- Synchronous blocking operations that stall the event loop.
- Redundant or highly expensive operations inside loops.
- Memory leaks or inefficient data structures.
Provide a clear, bulleted report of performance issues found and how to optimize them.`,
        tools: ["Read", "Grep", "Glob"],
        model: "sonnet"
      }
    }
  };

  console.log(`${colors.bright}${colors.blue}[System]${colors.reset} Starting agent query loop...`);
  console.log(`${colors.dim}Prompt: "${prompt}"${colors.reset}\n`);

  try {
    const messageStream = query({ prompt, options });

    for await (const message of messageStream) {
      const msg = message;

      // 1. Check for initialization or system messages
      if (msg.type === "system") {
        if (msg.subtype === "init") {
          console.log(`${colors.bright}${colors.blue}[System]${colors.reset} Initialized session: ${colors.cyan}${msg.session_id || "local"}${colors.reset}`);
        } else {
          console.log(`${colors.dim}[System:${msg.subtype}] ${JSON.stringify(msg.data || "")}${colors.reset}`);
        }
      }

      // 2. Handle subagent execution indicators
      if (msg.parent_tool_use_id) {
        // Output from within a subagent execution
        if (msg.type === "assistant" && msg.message?.content) {
          for (const block of msg.message.content) {
            if (block.type === "text") {
              const textLines = block.text.split("\n").map(line => `  ${colors.magenta}│${colors.reset} ${line}`).join("\n");
              console.log(textLines);
            }
          }
        }
        continue;
      }

      // 3. Handle main agent (parent) assistant messages
      if (msg.type === "assistant" && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === "text") {
            console.log(`${colors.bright}${colors.blue}Claude:${colors.reset} ${block.text}`);
          } else if (block.type === "tool_use") {
            // Detect if the tool is spawning a subagent (Task or Agent tool)
            if (block.name === "Task" || block.name === "Agent") {
              const subagentType = block.input?.subagent_type || "unknown";
              const taskPrompt = block.input?.prompt || "";
              console.log();
              console.log(`${colors.bright}${colors.bgMagenta} 🤖 SUBAGENT SPARKED: [${subagentType}] ${colors.reset}`);
              console.log(`${colors.magenta}┌────────────────────────────────────────────────────────────`);
              console.log(`│ ${colors.bright}Task instruction:${colors.reset} ${taskPrompt}`);
              console.log(`└────────────────────────────────────────────────────────────${colors.reset}`);
            } else {
              console.log(`${colors.yellow}🔧 Tool Call:${colors.reset} Using ${colors.bright}${block.name}${colors.reset} with arguments: ${colors.dim}${JSON.stringify(block.input)}${colors.reset}`);
            }
          }
        }
      }

      // 4. Handle tool results
      if ("result" in msg) {
        console.log(`${colors.green}✅ Tool Result:${colors.reset} ${colors.dim}${msg.result.substring(0, 150)}${msg.result.length > 150 ? "..." : ""}${colors.reset}`);
      }
    }
    
    console.log();
    console.log(`${colors.bright}${colors.green}🎉 Workflow completed successfully!${colors.reset}`);
  } catch (error) {
    console.error();
    console.error(`${colors.bright}${colors.red}❌ Error Running Agent Loop:${colors.reset}`);
    console.error(error.stack || error);
    console.log();
    console.log(`${colors.bright}${colors.yellow}Tip: Check if ANTHROPIC_API_KEY is configured in your shell environment.${colors.reset}`);
  }
}

main();
