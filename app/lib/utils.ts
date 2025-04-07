import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";
import { Message } from "../types/message";
import { calculateHistoryTokens } from "./tokens";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trimHistory(
  chatHistory: Message[],
  contextLimit: number
): Message[] {
  if (chatHistory.length <= 4) return chatHistory;

  let trimmed = [...chatHistory];
  while (calculateHistoryTokens(trimmed) > contextLimit * 0.7 && trimmed.length > 4) {
    trimmed = trimmed.slice(2);
  }

  if (trimmed.length < chatHistory.length) {
    const systemMessage: Message = {
      role: "system",
      content:
        "Some earlier messages were removed to stay within the model's context limit.",
    };
    return [systemMessage, ...trimmed];
  }

  return trimmed;
}
