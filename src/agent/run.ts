import 'dotenv/config';
import { streamText, type ModelMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getTracer, Laminar } from '@lmnr-ai/lmnr';
import { tools } from "./tools/index.ts";
import { executeTools } from "./executeTool.ts"
import { SYSTEM_PROMPT } from './system/prompt.ts'
import type { AgentCallbacks, ToolCallInfo } from '../types.ts';
import { filterCompatibleMessages} from "./system/filterMessages.ts"

Laminar.initialize({
    projectApiKey: process.env.LMNR_PROJECT_API_KEY,
})


const MODEL_NAME = "gpt-5-mini";



export const runAgent = async (
    userMessage: string,
    conversationHistory: ModelMessage[],
    callbacks: AgentCallbacks,
): Promise<ModelMessage[]> {
    const workingHistory = filterCompatibleMessages(conversationHistory):

    const messages: ModelMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }]
}





