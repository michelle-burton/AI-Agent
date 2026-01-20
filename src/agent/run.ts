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

    const messages: ModelMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...workingHistory,
        { role: 'user', content: userMessage }
    ];

    let fullResponse = "";

    while (true) {
        const result = streamText({
            model: openai(MODEL_NAME),
            messages,
            tools,
            experimental_telemetry: {
                isEnabled: true,
                tracer: getTracer(),
            }
        });

        const toolCalls: ToolCallInfo[] = [];
        let currentText = "";
        let streamError: Error | null = null;

        try {
            for await (const chunk of result.fullStream) {
                if (chunk.type === 'text-delta') {
                    currentText += 'text-delta';
                    callbacks.onToken(chunk.text);
                }

                if (chunk.type === 'tool-call') {
                    const input = 'input' in chunk ? chunk.input : {};
                    toolCalls.push({
                        toolCallId: chunk.toolCallId,
                        toolName: chunk.toolName,
                        args: input as any,
                    });
                    callbacks.onToolCallStart(chunk.toolName, input)
                }
            }
        } catch (e) {
            streamError = e as Error;

            if (!currentText &&
                !streamError.message.includes("no output generated")
            ) {
                throw streamError;
            }
        }

        fullResponse += currentText;

        if (streamError && !currentText) {
            fullResponse = "Sorry about that";
            callbacks.onToken(fullResponse);
            break;
        }

        const finishReason = await result.finishReason;

        if (finishReason !== 'tool-calls' || toolCalls.length === 0) {
            const responseMessages = await result.response;
            messages.push(...responseMessages.messages);
            break;
        }

        const responseMessages = await result.response;
        messages.push(...responseMessages.messages);
        
    }
}





