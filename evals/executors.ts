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

const TOOL_DEFINITIONS = {
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
        })
    },
}