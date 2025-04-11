"use client";

import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
const rehypeHighlight = require("rehype-highlight").default;
import "highlight.js/styles/github-dark.css";

import { useEffect, useRef } from "react";
import { Textarea, Button } from "../ui/";
import { Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Message } from "../../types/message";

import { Fragment } from "react";

function flattenChildren(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node?.map(flattenChildren).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    return flattenChildren((node as any).props.children);
  }
  return "";
}

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
    const { role, content } = message;
    const isUser = role === "user";
    const isSystem = role === "system";
    const isAssistant = role === "assistant";

    const cleanContent =
      typeof content === "string"
        ? content.replace(/\n`([^`\n]+)`\n/g, " `$1` ")
        : JSON.stringify(content, null, 2);

    return (
      <div
        key={index}
        className={`p-3 rounded-lg mb-3 text-lg ${
          isUser
            ? "bg-blue-400 ml-8 text-black"
            : isSystem
            ? "bg-[#14C7C3] border border-yellow-200"
            : "bg-[#14C7C3] mr-8 text-black"
        }`}
      >
        <div className="font-semibold mb-1">
          {isUser ? "You" : isSystem ? "System" : "Assistant"}
        </div>
        <div
          className={isAssistant ? "prose max-w-none dark:prose-invert" : ""}
        >
          {isAssistant ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                code({ node, className = "", children, ...props }) {
                  const codeString = flattenChildren(children).trim();
                  const block = /\blanguage-/.test(className);

                  if (!block) {
                    return (
                      <code className="bg-gray-800 text-[#d4d4d4] p-1 rounded text-sm">
                        {codeString}
                      </code>
                    );
                  }

                  return (
                    <Fragment>
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      <div className="relative group my-2">
                        <pre
                          className={`bg-gray-900 text-white p-4 rounded overflow-x-auto text-sm ${className}`}
                        >
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(codeString)
                          }
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white p-1 cursor-pointer rounded hover:bg-gray-700 transition-opacity"
                          aria-label="Copy code"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="pointer-events-none"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      </div>
                    </Fragment>
                  );
                },
              }}
            >
              {cleanContent}
            </ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    );
  };

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
            {chatHistory?.map(renderChatMessage)}
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
          className="border border-gray-400 text-white px-4"
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
