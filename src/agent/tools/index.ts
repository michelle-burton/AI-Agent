import { getDateTime } from "./dateTime.ts";
import type { ToolSet } from "ai";

// All tools combined for the agent
export const tools = {
  getDateTime,
} satisfies ToolSet;

export type ToolName = keyof typeof tools;
