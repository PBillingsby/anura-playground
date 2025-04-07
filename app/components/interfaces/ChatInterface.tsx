"use client";

import { Textarea, Button } from "../ui/";
import { Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Message } from "../../types/message";
import { useRef, useEffect } from "react";

type Props = {
  input: string;
  chatHistory: Message[];
  loading: boolean;
  tokenCount: number;
  inputTokens: number;
  historyTokens: number;
  showTokenWarning: boolean;
  contextLimit: number;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onTrimHistory: () => void;
};

export default function ChatInterface({
  input,
  chatHistory,
  loading,
  tokenCount,
  inputTokens,
  historyTokens,
  showTokenWarning,
  contextLimit,
  onChange,
  onSubmit,
  onTrimHistory,
}: Props) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const renderChatMessage = (message: Message, index: number) => {
    console.log("-----", message);

    return (
      <div
        key={index}
        className={`p-3 rounded-lg mb-3 ${
          message.role === "user"
            ? "bg-blue-400 ml-8 text-black text-lg"
            : message.role === "system"
            ? "bg-[#14C7C3] border border-yellow-200"
            : "bg-[#14C7C3] mr-8 text-black text-lg"
        }`}
      >
        <div className="font-semibold mb-1">
          {message.role === "user"
            ? "You"
            : message.role === "system"
            ? "System"
            : "Assistant"}
        </div>
        <div
          className={
            message.role === "assistant"
              ? "prose max-w-none dark:prose-invert"
              : ""
          }
        >
          {message.role === "assistant" ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {showTokenWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center text-yellow-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>
            Approaching token limit ({tokenCount.toLocaleString()} of{" "}
            {contextLimit.toLocaleString()}). Consider trimming history or
            starting a new conversation.
          </span>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto mb-4 border rounded-lg"
        ref={chatContainerRef}
      >
        {chatHistory.length > 0 ? (
          <div className="p-4">
            {chatHistory.map(renderChatMessage)}
            {loading && (
              <div className="p-3 rounded-lg mb-3 bg-[#14C7C3] text-black mr-8">
                <div className="font-semibold mb-1">Assistant</div>
                <div className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <img
              src="/robofrog.png"
              className="w-full max-w-xs sm:max-w-xs md:max-w-md"
            />
            <div className="text-gray-400 text-center text-md md:text-lg">
              Start a conversation with the model
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-start space-x-2">
        <div className="flex-1">
          <Textarea
            value={input}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your message here..."
            className="resize-none w-full p-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  const form = e.currentTarget.closest("form");
                  if (form) {
                    const event = new Event("submit", {
                      bubbles: true,
                      cancelable: true,
                    });
                    form.dispatchEvent(event);
                  }
                }
              }
            }}
          />
        </div>
        <div className="flex items-center my-auto">
          <Button
            type="submit"
            className="border border-white flex items-center h-full"
            disabled={loading || !input.trim() || showTokenWarning}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
      <div className="text-xs text-gray-500 mt-1">
        Current input: ~{inputTokens} tokens | History: ~{historyTokens} tokens
      </div>
      {chatHistory.length > 4 && (
        <Button
          onClick={onTrimHistory}
          className="mt-4 w-full border border-white bg-yellow-100 hover:bg-yellow-200"
        >
          Trim older messages
        </Button>
      )}
    </div>
  );
}
