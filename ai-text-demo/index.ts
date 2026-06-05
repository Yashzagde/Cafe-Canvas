import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import 'dotenv/config';

const client = new GoogleGenAI({});

async function main() {
  const base64Image = fs.readFileSync("chart.png", { encoding: "base64" });

  const interactionInline = await client.interactions.create({
    agent: "antigravity-preview-05-2026",
    input: [
      { type: "text", text: "Analyze this chart and summarize the trends." },
      {
        type: "image",
        data: base64Image,
        mime_type: "image/png",
      },
    ],
    environment: "remote",
  }, { timeout: 300000 });

  console.log(interactionInline.output_text);
}

main().catch(console.error);
