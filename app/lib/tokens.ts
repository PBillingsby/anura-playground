import { Message } from "../types/message";

export const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export const calculateHistoryTokens = (messages: Message[]): number => {
  let total = 0;
  for (const message of messages) {
    total += estimateTokenCount(message.content);
    total += 4;
  }
  return total + 10;
};

export const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  default: 4000,
  "deepseek-r1:7b": 8192,
  "llava:7b": 4096,
  "phi4:14b": 16384,
  "qwen2.5:7b": 8192,
  "deepscaler:1.5b": 2048,
  "gemma3:4b": 8192,
  "llama3.1:8b": 8192,
  "mistral:7b": 8192,
  "openthinker:7b": 8192,
  "phi4-mini:3.8b": 4096,
  "qwen2.5-coder:7b": 16384,
};

export const getContextLimit = (model: string): number => {
  return MODEL_CONTEXT_LIMITS[model] || MODEL_CONTEXT_LIMITS.default;
};
