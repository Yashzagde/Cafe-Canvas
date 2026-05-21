# Claude Agent SDK & Agent Teams Orchestration Workspace

Welcome to your Claude Agent SDK project workspace! This environment is configured to run autonomous AI agents and coordinate multi-agent teams using the Anthropic Claude Agent SDK and Claude Code.

## 📂 Project Structure

- **`package.json`**: Node.js configuration file with `@anthropic-ai/claude-agent-sdk` dependency.
- **`utils.js`**: A target utility file containing intentional bugs, security flaws (hardcoded secrets), and performance issues (synchronous I/O in event loops).
- **`agent-demo.js`**: The main JavaScript execution script. It initializes the SDK query loop, defines two specialized subagents (`security-analyzer` and `performance-profiler`), delegates tasks to them, streams their progress in real-time, and merges their outputs.
- **`run-demo.bat`**: A Windows batch file launcher that simplifies environment verification and executes the demo.
- **`test-sdk.js`**: A diagnostic script used to test API connectivity and login status.

---

## 🛠️ Global Settings & Configuration

Agent Teams have been enabled globally by configuring `C:\Users\yash\.claude\settings.json`:
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "teammateMode": "in-process"
}
```
*Note: Since `tmux` is not natively available on Windows, teammateMode is configured to `in-process` to run teams directly within the active shell session.*

---

## 🚀 How to Run the Demo

### Prerequisites
- **Node.js** (v18 or higher) installed on your system.
- An **Anthropic API Key** (Console key starting with `sk-ant-`) or provider credentials (Bedrock, Vertex AI).

### Step 1: Execute the Batch Launcher
Simply double-click `run-demo.bat` or run it via PowerShell/Command Prompt:
```powershell
.\run-demo.bat
```

### Step 2: Authentication
If `ANTHROPIC_API_KEY` is not present in your environment, the launcher will prompt you to paste it.
Alternatively, you can set it directly in your terminal before running:
```powershell
$env:ANTHROPIC_API_KEY="your-api-key-here"
node agent-demo.js
```

---

## 🤖 How the Multi-Agent System Works

The orchestrator script `agent-demo.js` utilizes key features of the Claude Agent SDK:

1. **Subagent Declarations (`options.agents`)**:
   - **`security-analyzer`**: Focuses strictly on secrets, vulnerabilities, and error boundaries.
   - **`performance-profiler`**: Focuses strictly on asynchronous execution and CPU performance.
   
2. **Context Isolation & Delegation**:
   The parent agent receives the main prompt and decides how to split the work. It invokes the subagents via the **Agent tool**. Each subagent runs in its own context window to avoid token bloat and keeps intermediate steps hidden from the parent. Only their final audit report is sent back.

3. **Event Stream Parsing**:
   The script streams events from the query generator:
   - Renders subagent thoughts in **magenta** (`parent_tool_use_id`).
   - Renders parent actions and descriptions in **blue**.
   - Renders tool usage in **yellow** and final success messages in **green**.

4. **Code Rewrite & Refactoring**:
   Once the parent agent receives the feedback, it modifies `utils.js` autonomously.

---

## 🔍 Troubleshooting

### 1. Error: `Not logged in · Please run /login`
This error occurs when the SDK tries to use CLI-based session credentials but the global `claude` CLI is not authenticated.
- **Fix**: The easiest way is to supply an `ANTHROPIC_API_KEY` environment variable (either via `run-demo.bat` prompt or a `.env` file). The SDK will automatically use this key.
- **Alternative Fix**: Open a standard Command Prompt and run `claude` once to perform the interactive browser OAuth login. Once the global CLI is logged in, the SDK can piggyback on those credentials.

### 2. Permissions & Allowed Tools
By default, the demo runs in `permissionMode: "acceptEdits"` and permits `["Read", "Write", "Edit", "Glob", "Grep", "Agent"]`. This allows the agent to execute safely within this directory without prompting you for every file operation.
