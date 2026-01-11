import 'dotenv/config';

import { generateText, stepCountIs, type ModelMessage } from 'ai'
import { openai } from '@ai-sdk/openai'
import { SYSTEM_PROMPT } from './system/prompt.ts'
import type { AgentCallbacks } from '../types.ts';
import {tools} from "./tools/index.ts"
import { executeTools } from './executeTool.ts';
const MODEL_NAME = "gpt-5-mini";


export const runAgent = async (
    userMessage: string,
    conversationHistory: ModelMessage[],
    callbacks: AgentCallbacks,
) => {
    const { text, toolCalls } = await generateText({
        model: openai(MODEL_NAME),
        prompt: userMessage,
        system: SYSTEM_PROMPT,
        tools,
        stopWhen: stepCountIs(2),
    });

    console.log(text)
    // toolCalls.forEach(async (tc) => {
    //     const result = await executeTools(tc.toolName as any, tc.input)
    //     console.log(result)
    // })
   // console.log(text, toolCalls)
};

// run in terminal: npx tsx src/agent/run.ts
runAgent("What is the current time?")