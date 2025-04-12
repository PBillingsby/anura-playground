"use client";

import { useEffect, useRef, Fragment, ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Textarea, Button } from "../ui/";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import "highlight.js/styles/github-dark.css";

import { Message } from "../../types/message";

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

function flattenChildren(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(flattenChildren).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    return flattenChildren(
      (node as { props: { children: ReactNode } }).props.children
    );
  }
  return "";
}

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
        ? content.replace(/<\/?think>/g, "")
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
              rehypePlugins={[
                rehypeRaw,
                [
                  rehypeSanitize,
                  {
                    ...defaultSchema,
                    tagNames: [...(defaultSchema.tagNames ?? []), "think"],
                  },
                ],
                rehypeHighlight,
              ]}
              components={{
                code({ className = "", children, ...props }) {
                  const codeString = flattenChildren(children).trim();
                  const isBlock = /\blanguage-/.test(className);

                  if (!isBlock) {
                    return (
                      <code className="bg-gray-800 text-[#d4d4d4] px-1 py-[2px] rounded text-sm">
                        {codeString}
                      </code>
                    );
                  }

                  return (
                    <pre
                      className={`bg-gray-900 text-white p-4 rounded overflow-x-auto text-sm ${className}`}
                    >
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
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
                  form.dispatchEvent(
                    new Event("submit", { bubbles: true, cancelable: true })
                  );
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
          className="w-auto mx-auto border border-white text-black bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30.556 30.556"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M26.311,23.224c-0.812-1.416-2.072-2.375-3.402-2.736c-1.051-0.287-2.141-0.199-3.084,0.334l-2.805-4.904   c1.736-3.463,5.633-11.227,6.332-12.451C24.258,1.884,22.637,0,22.637,0l-7.36,12.872L7.919,0c0,0-1.62,1.884-0.715,3.466   c0.7,1.225,4.598,8.988,6.332,12.451l-2.804,4.904c-0.943-0.533-2.035-0.621-3.084-0.334c-1.332,0.361-2.591,1.32-3.403,2.736   c-1.458,2.547-0.901,5.602,1.239,6.827c0.949,0.545,2.048,0.632,3.107,0.345c1.329-0.363,2.591-1.322,3.402-2.735   c0.355-0.624,0.59-1.277,0.71-1.926v0.001c0.001-0.005,0.001-0.01,0.006-0.015c0.007-0.054,0.017-0.108,0.022-0.167   c0.602-4.039,1.74-6.102,2.545-7.104c0.807,1.002,1.946,3.064,2.547,7.104c0.006,0.059,0.016,0.113,0.021,0.167   c0.004,0.005,0.004,0.01,0.006,0.015v-0.001c0.121,0.648,0.355,1.302,0.709,1.926c0.812,1.413,2.074,2.372,3.404,2.735   c1.059,0.287,2.158,0.2,3.109-0.345C27.213,28.825,27.768,25.771,26.311,23.224z M9.911,26.468   c-0.46,0.803-1.189,1.408-1.948,1.615c-0.338,0.092-0.834,0.148-1.289-0.113c-0.97-0.555-1.129-2.186-0.346-3.556   c0.468-0.812,1.177-1.403,1.95-1.614c0.335-0.091,0.831-0.146,1.288,0.113C10.537,23.47,10.695,25.097,9.911,26.468z M23.881,27.97   c-0.455,0.262-0.949,0.205-1.287,0.113c-0.76-0.207-1.488-0.812-1.949-1.615c-0.783-1.371-0.625-2.998,0.346-3.555   c0.457-0.26,0.953-0.204,1.289-0.113c0.771,0.211,1.482,0.802,1.947,1.614C25.01,25.784,24.852,27.415,23.881,27.97z" />
          </svg>
          Trim older messages
        </Button>
      )}
    </div>
  );
}
