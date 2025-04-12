import { InputState } from "@/app/types/state";
import { Message } from "../../types/message";
import {
  calculateHistoryTokens,
} from "../../lib/tokens";

export const handleChat = async (
  input: string,
  selectedModel: string,
  chatHistory: Message[],
  setChatHistory: React.Dispatch<React.SetStateAction<Message[]>>,
  setInputState: React.Dispatch<React.SetStateAction<InputState>>,
  temperature: number,
  maxTokens: number,
  contextLimit: number
): Promise<void> => {
  const userMessage: Message = { role: "user", content: input };
  const newHistory = [...chatHistory, userMessage];

  if (calculateHistoryTokens(newHistory) + 1000 > contextLimit) {
    alert("Message too long for context window. Try trimming the conversation.");
    return;
  }

  setChatHistory(newHistory);
  setInputState((s) => ({ ...s, input: "", temperature }));

  const res = await fetch("/api/run-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: selectedModel,
      messages: newHistory,
      temperature,
      max_tokens: maxTokens,
      category: "chat"
    }),
  });

  const data = await res.json();
  const reply: Message = {
    role: "assistant",
    content: data.output || "No response.",
  };

  setChatHistory((prev) => [...prev, reply]);
};
