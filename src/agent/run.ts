import 'dotenv/config';

import { generateText, stepCountIs, type ModelMessage } from 'ai'
import { openai } from '@ai-sdk/openai'
import { SYSTEM_PROMPT } from './system/prompt.ts'
import type { AgentCallbacks } from '../types.ts';
import { getTracer, Laminar} from '@lmnr-ai/lmnr'

import { tools } from "./tools/index.ts"

const MODEL_NAME = "gpt-5-mini";

Laminar.initialize({
    projectApiKey: process.env.LMNR_PROJECT_API_KEY,
})

export const runAgent = async (
    userMessage: string,
    conversationHistory: ModelMessage[],
    callbacks: AgentCallbacks,
) => {
    const { text, toolCalls } = await generateText({
        model: openai(MODEL_NAME),
        //prompt: userMessage,
        messages: [],
        system: SYSTEM_PROMPT,
        //temperature: 0, // less randomness
        tools,
        // stopWhen: stepCountIs(2),
        experimental_telemetry: {
            isEnabled: true,
            tracer: getTracer(),
        }
    });
    
    await Laminar.flush();

     console.log('done')
    //console.log(text)
    // toolCalls.forEach(async (tc) => {
    //     const result = await executeTools(tc.toolName as any, tc.input)
    //     console.log(result)
    // })
   // console.log(text, toolCalls)
};

// run in terminal: npx tsx src/agent/run.ts
//runAgent("What is the current time?")


