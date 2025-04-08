"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import CategorySelector from "../components/sidebar/CategorySelector";
import ModelSelector from "../components/sidebar/ModelSelector";
import ChatInterface from "../components/interfaces/ChatInterface";
import ImageInterface from "../components/interfaces/ImageInterface";
import TemperatureSlider from "./sidebar/TemperatureSlider";
import MaxTokenSlider from "./sidebar/MaxTokenSlider";
import {
  MODEL_CONTEXT_LIMITS,
  estimateTokenCount,
  calculateHistoryTokens,
  getContextLimit,
} from "../lib/tokens";
import { trimHistory } from "../lib/utils";
import { Message } from "../types/message";

export default function Main() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [appState, setAppState] = useState({
    category: "text",
    models: [] as string[],
    selectedModel: "",
    chatMode: true,
  });

  const [inputState, setInputState] = useState({
    input: "",
    generatedImage: null as string | null,
    temperature: 0.7,
  });

  const [status, setStatus] = useState({
    loading: false,
    tokenCount: 0,
    inputTokens: 0,
    historyTokens: 0,
    showTokenWarning: false,
  });

  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(4000);

  const { category, models, selectedModel } = appState;
  const { input, generatedImage } = inputState;
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
        setInputState({ input: "", generatedImage: null, temperature: 0.7 });
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
    const currentHistoryTokens = calculateHistoryTokens(chatHistory);
    const total = currentInputTokens + currentHistoryTokens + 1000;

    setStatus((s) => ({
      ...s,
      inputTokens: currentInputTokens,
      historyTokens: currentHistoryTokens,
      tokenCount: total,
      showTokenWarning: total > contextLimit * 0.9,
    }));
  }, [input, chatHistory, selectedModel, contextLimit]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleInputChange = (val: string) =>
    setInputState((s) => ({ ...s, input: val }));

  const selectModel = (id: string) => {
    const modelLimit =
      MODEL_CONTEXT_LIMITS[selectedModel] ?? MODEL_CONTEXT_LIMITS["default"];
    const defaultMaxTokens = Math.floor(modelLimit * 0.6);
    setMaxTokens(defaultMaxTokens);
    setAppState((prev) => ({ ...prev, selectedModel: id }));
    setInputState({ input: "", generatedImage: null, temperature: 0.7 });
    setChatHistory([]);
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
    } else {
      const userMessage: Message = { role: "user", content: input };
      const newHistory = [...chatHistory, userMessage];

      if (calculateHistoryTokens(newHistory) + 1000 > contextLimit) {
        alert(
          "Message too long for context window. Try trimming the conversation."
        );
        return;
      }

      setChatHistory(newHistory);
      setInputState((s) => ({ ...s, input: "", temperature }));

      try {
        const res = await fetch("/api/run-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: selectedModel,
            messages: newHistory,
            temperature,
            max_tokens: maxTokens,
          }),
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
    <div className="flex h-screen">
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black z-20 flex items-center justify-between p-4 border-b">
        <span className="flex flex-row items-center gap-2 text-[#14C7C3] font-semibold text-lg">
          <img src="/lp-logo.svg" alt="Lilypad Logo" className="w-6 h-6" />
          Anura Playground
        </span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? (
            <X className="text-white" />
          ) : (
            <Menu className="text-white" />
          )}
        </button>
      </div>

      <div
        ref={sidebarRef}
        className={`fixed md:static top-0 left-0 h-full w-64 bg-black border-r p-4 z-30 transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        <div className="hidden md:flex items-center gap-2 text-[#14C7C3] text-xl font-semibold">
          <img src="/lp-logo.svg" alt="Lilypad Logo" className="w-6 h-6" />
          Anura Playground
        </div>

        <div className="flex flex-col gap-4 md:gap-6 flex-1 mt-6">
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
          {category !== "image" && (
            <>
              <TemperatureSlider
                temperature={temperature}
                setTemperature={setTemperature}
              />
              <MaxTokenSlider
                maxTokens={maxTokens}
                setMaxTokens={setMaxTokens}
                modelLimit={
                  MODEL_CONTEXT_LIMITS[selectedModel] ??
                  MODEL_CONTEXT_LIMITS["default"]
                }
              />
            </>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto mt-14 md:mt-0">
        {!selectedModel ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-center">
            <div className="animate-pulse text-lg">Loading models...</div>
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
        ) : (
          <ChatInterface
            input={input}
            chatHistory={chatHistory}
            loading={loading}
            tokenCount={tokenCount}
            inputTokens={inputTokens}
            historyTokens={historyTokens}
            showTokenWarning={showTokenWarning}
            contextLimit={contextLimit}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onTrimHistory={handleTrim}
          />
        )}
      </div>
    </div>
  );
}
