"use client";

import React, { useEffect, useRef } from "react";
import { WebSearchResult } from "../../types/websearch";
import { Textarea, Button } from "../ui/";
import { Loader2, RefreshCw } from "lucide-react";

type Props = {
  input: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  results: WebSearchResult[];
  relatedQueries: string[];
  setWebResults: (results: WebSearchResult[]) => void;
};

export const WebSearchInterface: React.FC<Props> = ({
  input,
  onChange,
  onSubmit,
  loading,
  results,
  relatedQueries,
  setWebResults,
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollTop = 0;
    }
  }, [results]);

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div
        ref={resultsRef}
        className="flex-1 overflow-y-auto rounded border p-4 mb-2"
      >
        {results?.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Results:</h3>
              <button
                onClick={() => setWebResults([])}
                type="button"
                className="flex items-center cursor-pointer gap-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                Clear
              </button>
            </div>

            {results?.map((res, i) => (
              <div key={i} className="border-b border-gray-300 pb-3 mb-3">
                <a
                  href={res.url}
                  className="w-full text-[#14C7C3] font-medium hover:underline inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {res.title}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ verticalAlign: "middle" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6m5-5h5m0 0v5m0-5L10 14"
                    />
                  </svg>
                </a>
                <p className="text-sm text-gray-200">{res.description}</p>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 h-full text-center">
            <img
              src="/robofrog.png"
              className="hidden md:block w-40 md:w-60 mb-4"
              alt="RoboFrog"
            />
            <p className="text-md md:text-lg">Search for something below.</p>
          </div>
        )}

        {relatedQueries.length > 0 && (
          <div className="mt-8">
            <h4 className="text-md font-semibold mb-2">Related Queries:</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              {relatedQueries?.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1 text-[#14C7C3]">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(q);
                      const form = document.querySelector("form");
                      if (form) {
                        const event = new Event("submit", {
                          bubbles: true,
                          cancelable: true,
                        });
                        form.dispatchEvent(event);
                      }
                    }}
                    className="text-left text-[#14C7C3] hover:underline cursor-pointer"
                  >
                    Search for: {q}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 mb-1">
        <Textarea
          value={input}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search the web..."
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
          disabled={loading || !input.trim()}
          className="border border-gray-400 text-white px-4"
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="animate-spin h-4 w-4" />
              Searching...
            </span>
          ) : (
            "Search"
          )}
        </Button>
      </form>
      <div className="text-xs text-gray-500 mb-1">
        Currently returns 10 results
      </div>
    </div>
  );
};
