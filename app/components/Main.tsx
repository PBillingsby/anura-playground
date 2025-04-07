"use client";

import { useEffect, useState } from "react";
import CategorySelector from "../components/sidebar/CategorySelector";
import ModelSelector from "../components/sidebar/ModelSelector";
import ModeToggle from "../components/sidebar/ModeToggle";
import StandardInterface from "../components/interfaces/StandardInterface";
import ChatInterface from "../components/interfaces/ChatInterface";
import ImageInterface from "../components/interfaces/ImageInterface";

import {
  estimateTokenCount,
  calculateHistoryTokens,
  getContextLimit,
} from "../lib/tokens";
import { trimHistory } from "../lib/utils";
import { Message } from "../types/message";

export default function Main() {
  const [appState, setAppState] = useState({
    category: "text",
    models: [] as string[],
    selectedModel: "",
    chatMode: false,
  });

  const [inputState, setInputState] = useState({
    input: "",
    output: "",
    generatedImage: null as string | null,
  });

  const [status, setStatus] = useState({
    loading: false,
    tokenCount: 0,
    inputTokens: 0,
    historyTokens: 0,
    showTokenWarning: false,
  });

  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  const { category, models, selectedModel, chatMode } = appState;
  const { input, output, generatedImage } = inputState;
  const { loading, tokenCount, inputTokens, historyTokens, showTokenWarning } =
    status;

  const contextLimit = getContextLimit(selectedModel);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const endpoint =
          category === "image"
            ? "https://anura-testnet.lilypad.tech/api/v1/image/models"
            : "https://anura-testnet.lilypad.tech/api/v1/models";

        const res = await fetch("/api/fetch-models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });

        const data = await res.json();
        setAppState((prev) => ({
          ...prev,
          models: data.models || data || [],
          selectedModel: data.models?.[0] || "",
        }));
        setInputState({ input: "", output: "", generatedImage: null });
        setChatHistory([]);
      } catch (err) {
        console.error("Failed to fetch models", err);
        setAppState((prev) => ({ ...prev, models: [] }));
      }
    };

    fetchModels();
  }, [category]);

  useEffect(() => {
    if (!selectedModel) return;

    const currentInputTokens = estimateTokenCount(input);

    if (chatMode) {
      const currentHistoryTokens = calculateHistoryTokens(chatHistory);
      const total = currentInputTokens + currentHistoryTokens + 1000;

      setStatus((s) => ({
        ...s,
        inputTokens: currentInputTokens,
        historyTokens: currentHistoryTokens,
        tokenCount: total,
        showTokenWarning: total > contextLimit * 0.9,
      }));
    } else {
      setStatus((s) => ({
        ...s,
        inputTokens: currentInputTokens,
        tokenCount: currentInputTokens,
        showTokenWarning: currentInputTokens + 1000 > contextLimit * 0.9,
      }));
    }
  }, [input, chatHistory, selectedModel, chatMode, contextLimit]);

  const handleInputChange = (val: string) =>
    setInputState((s) => ({ ...s, input: val }));

  const selectModel = (id: string) => {
    setAppState((prev) => ({ ...prev, selectedModel: id }));
    setInputState({ input: "", output: "", generatedImage: null });
    if (chatMode) setChatHistory([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedModel || !input.trim()) return;

    setStatus((s) => ({ ...s, loading: true }));

    if (category === "image") {
      setInputState((s) => ({ ...s, generatedImage: null }));
      try {
        const res = await fetch("/api/run-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: selectedModel, inputValue: input }),
        });
        const data = await res.json();
        setInputState((s) => ({ ...s, generatedImage: data.image }));
      } catch (err) {
        console.error("Image generation error:", err);
        alert("Failed to generate image.");
      } finally {
        setStatus((s) => ({ ...s, loading: false }));
      }
    } else if (chatMode) {
      const userMessage: Message = { role: "user", content: input };
      const newHistory = [...chatHistory, userMessage];

      if (calculateHistoryTokens(newHistory) + 1000 > contextLimit) {
        alert(
          "Message too long for context window. Try trimming the conversation."
        );
        return;
      }

      setChatHistory(newHistory);
      setInputState((s) => ({ ...s, input: "" }));

      try {
        const res = await fetch("/api/run-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: selectedModel, messages: newHistory }),
        });

        const data = await res.json();
        const reply: Message = {
          role: "assistant",
          content: data.output || "No response.",
        };
        setChatHistory((prev) => [...prev, reply]);
      } catch (err) {
        console.error("Chat error:", err);
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: "Error generating response." },
        ]);
      } finally {
        setStatus((s) => ({ ...s, loading: false }));
      }
    } else {
      if (inputTokens + 1000 > contextLimit) {
        alert("Input too long. Please shorten your text.");
        return;
      }

      setInputState((s) => ({ ...s, output: "" }));
      try {
        const res = await fetch("/api/run-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: selectedModel, input }),
        });
        const data = await res.json();
        setInputState((s) => ({
          ...s,
          output: data.output || "No output received.",
        }));
      } catch (err) {
        console.error(err);
        setInputState((s) => ({ ...s, output: "Error running model." }));
      } finally {
        setStatus((s) => ({ ...s, loading: false }));
      }
    }
  };

  const handleTrim = () => {
    const trimmed = trimHistory(chatHistory, contextLimit);
    setChatHistory(trimmed);
  };

  const resetImage = () =>
    setInputState((s) => ({ ...s, generatedImage: null, input: "" }));

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = "generated-image.png";
    a.click();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-black border-r p-4 flex flex-col">
        <span className="flex flex-row items-center gap-2 pb-4">
          <h1 className="text-xl text-[#14C7C3] font-semibold">
            Anura Playground
          </h1>
          <img src="/lp-logo.svg" alt="Lilypad Logo" className="w-6 h-6" />
        </span>
        <div className="flex flex-col gap-6 flex-1">
          <CategorySelector
            category={category}
            setCategory={(c: string) =>
              setAppState((s) => ({ ...s, category: c }))
            }
          />
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            selectModel={selectModel}
          />
          {category === "text" && (
            <ModeToggle
              chatMode={chatMode}
              setChatMode={(mode: boolean) =>
                setAppState((s) => ({ ...s, chatMode: mode }))
              }
              setOutput={(val: string) =>
                setInputState((s) => ({ ...s, output: val }))
              }
              setChatHistory={setChatHistory}
            />
          )}
        </div>

        <div className="mt-6 md:mt-auto text-center hidden md:block font-semibold text-lg text-[#14C7C3]">
          Made with Lilypad
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!selectedModel ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Select a Model</h2>
              <p>
                {category === "image"
                  ? "Choose an image generation model from the sidebar to begin creating images."
                  : "Select a model from the sidebar to begin."}
              </p>
            </div>
          </div>
        ) : category === "image" ? (
          <ImageInterface
            input={input}
            loading={loading}
            generatedImage={generatedImage}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onReset={resetImage}
            onDownload={handleDownload}
          />
        ) : chatMode ? (
          <ChatInterface
            input={input}
            chatHistory={chatHistory}
            loading={loading}
            tokenCount={tokenCount}
            inputTokens={inputTokens}
            historyTokens={historyTokens}
            showTokenWarning={showTokenWarning}
            contextLimit={getContextLimit(selectedModel)}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onTrimHistory={handleTrim}
          />
        ) : (
          <StandardInterface
            input={input}
            output={output}
            loading={loading}
            inputTokens={inputTokens}
            showTokenWarning={showTokenWarning}
            contextLimit={getContextLimit(selectedModel)}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
