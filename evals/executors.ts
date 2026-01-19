import { generateText, stepCountIs, tool, type ToolSet } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";


import type {
  EvalData,
  SingleTurnResult,
  MultiTurnEvalData,
  MultiTurnResult,
} from "./types.ts";
import { readFile } from "fs";
import { buildMessages } from "./utils.ts";
import { ToolApproval } from "../src/ui/components/ToolApproval.tsx";
import { ToolCall } from "../dist/ui/components/ToolCall.js";

const TOOL_DEFINITIONS: any = {
    readFile: {
        description: "Read the contents of a file at the specified path.",
        parmeters: z.object({
            path: z.string().describe("the path to the file that you want to read"),
        })
    },
    writeFile: {
        description: "Write given content to the file at the given path.",
        parmeters: z.object({
            path: z.string().describe("the path to the file that you want to write to"),
            content: z.string().describe("the content you want to write to the file"),
        })
    },
    listFile: {
        description: "List all the files in a directory",
        parmeters: z.object({
            path: z.string().describe("the path the directory in which you want to list the files"),
        })
    },
    deleteFile: {
        description: "Delete the file at the the given path.",
        parmeters: z.object({
            path: z.string().describe("the path to the file that you want to delete"),
        })
    },
    runCommand: {
        description: "Execute a shell command and return its output",
        parmeters: z.object({
            path: z.string().describe("the shell command to execute"),
        }),
    },
};

export const SingleTurnExecutor = async (data: EvalData) => {
    const messages = buildMessages(data);

    const tools: ToolSet = {};
    for (const toolName of data.tools) {
        const def = TOOL_DEFINITIONS[toolName];

        if (def) {
            tools[toolName] = tool({
                description: def.description,
                inputSchema: def.parmeters,
            })
        }
    }
    const { toolCalls } = await generateText({
        model: openai(data.config?.model ?? 'gpt-5-mini'),
        messages,
        tools,
        stopWhen: stepCountIs(1),
        temperature: data.config?.temperature ?? undefined,
    })
    const calls = toolCalls.map((tc) => ({
        toolName: tc.toolName,
        args: 'args' in tc ? tc.args : {},
    }))
    const toolNames = toolCalls.map((tc) => tc.toolName);

    return {
        toolCalls,
        toolNames,
        selectedAny: toolNames.length > 0,
    };
};