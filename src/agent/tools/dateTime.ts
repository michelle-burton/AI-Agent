import {tool } from "ai";
import { z } from "zod";

export const getDateTime = tool({
    description:
        "returns the current date and time. Useful for when you need current date of time",
    inputSchema: z.object({}),
    execute: async () => {
        return new Date().toISOString();
    }
})

