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

  const renderChatMessage = (message: Message, index: number) => (
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

  return (
    <div className="flex flex-col h-full max-h-screen">
      {showTokenWarning && (
        <div className="p-2 text-sm bg-yellow-100 border border-yellow-300 rounded mb-2 text-yellow-800 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Approaching token limit ({tokenCount} of {contextLimit}). Trim history
          if needed.
        </div>
      )}

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto rounded border p-4 mb-2"
      >
        {chatHistory.length > 0 ? (
          <>
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 h-full text-center">
            <img
              src="/robofrog.png"
              className="hidden md:block w-40 md:w-60 mb-4"
              alt="RoboFrog"
            />
            <p className="text-md md:text-lg">
              Start a conversation with the model.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 mb-1">
        <Textarea
          value={input}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message here..."
          className="resize-none w-full p-2"
          rows={2}
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
        <Button
          type="submit"
          disabled={loading || !input.trim() || showTokenWarning}
          className="h-full border border-gray-400"
        >
          {loading ? "Sending..." : "Send"}
        </Button>
      </form>

      <div className="text-xs text-gray-500 mb-1">
        Current input: ~{inputTokens} tokens | History: ~{historyTokens} tokens
      </div>
      {chatHistory.length > 4 && (
        <Button
          onClick={onTrimHistory}
          className="w-full border border-white bg-yellow-100 hover:bg-yellow-200"
        >
          Trim older messages
        </Button>
      )}
    </div>
  );
}
