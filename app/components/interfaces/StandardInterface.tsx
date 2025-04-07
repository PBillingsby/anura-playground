"use client";

import { Textarea, Button } from "../ui";
import { AlertCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Props = {
  input: string;
  output: string;
  loading: boolean;
  inputTokens: number;
  showTokenWarning: boolean;
  contextLimit: number;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export default function StandardInterface({
  input,
  output,
  loading,
  inputTokens,
  showTokenWarning,
  contextLimit,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      {showTokenWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center text-yellow-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>
            Your input is approaching the token limit. The model may not be able
            to process the entire text.
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 border border-white rounded-lg">
        {loading ? (
          <div className="p-4 text-white text-sm bg-black rounded">
            <div className="flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Running model...
            </div>
          </div>
        ) : output ? (
          <div className="p-4 text-sm bg-black text-white rounded">
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
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
          />
        </div>
        <div className="flex items-center my-auto">
          <Button
            type="submit"
            className="border border-white flex items-center h-full px-4 py-2"
            disabled={loading || !input.trim() || showTokenWarning}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
      <div className="text-xs text-gray-500 mt-1">
        Token count: ~{inputTokens} (limit: {contextLimit.toLocaleString()})
      </div>
    </div>
  );
}
