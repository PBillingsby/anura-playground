"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import CategorySelector from "../components/sidebar/CategorySelector";
import ModelSelector from "../components/sidebar/ModelSelector";
import ChatInterface from "../components/interfaces/ChatInterface";
import ImageInterface from "../components/interfaces/ImageInterface";
import { WebSearchInterface } from "../components/interfaces/WebSearchInterface";
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
import { InputState, StatusState } from "../types/state";
import { WebSearchResult } from "../types/websearch";
import {
  handleChat,
  handleImageGeneration,
  handleWebSearch,
} from "../lib/handlers";

export default function Main() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [appState, setAppState] = useState({
    category: "text",
    models: [] as string[],
    selectedModel: "",
    chatMode: true,
  });

  const [inputState, setInputState] = useState<InputState>({
    input: "",
    generatedImage: null as string | null,
    temperature: 0.7,
  });

  const [status, setStatus] = useState<StatusState>({
    loading: false,
    tokenCount: 0,
    inputTokens: 0,
    historyTokens: 0,
    showTokenWarning: false,
  });
  const [error, setError] = useState<string>("");

  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(4000);

  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
  const [numberOfResults, setNumberOfResults] = useState<number>(10);

  const { category, models, selectedModel } = appState;
  const { input, generatedImage } = inputState;
  const { loading, tokenCount, inputTokens, historyTokens, showTokenWarning } =
    status;
  const contextLimit = getContextLimit(selectedModel);

  useEffect(() => {
    const fetchModels = async () => {
      if (category === "webSearch") {
        setAppState((prev) => ({
          ...prev,
          models: ["websearch-default"],
          selectedModel: "websearch-default",
        }));
        return;
      }

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

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    setError("");
  }, [category]);

  const handlerMap: Record<string, () => Promise<void>> = {
    image: () =>
      handleImageGeneration(input, selectedModel, setInputState, setStatus),
    text: () =>
      handleChat(
        input,
        selectedModel,
        chatHistory,
        setChatHistory,
        setInputState,
        temperature,
        maxTokens,
        contextLimit
      ),
    webSearch: () =>
      handleWebSearch(
        input,
        numberOfResults,
        setWebResults,
        setRelatedQueries,
        process.env.NEXT_PUBLIC_ANURA_API_KEY!
      ),
  };

  const handleInputChange = (val: string) =>
    setInputState((s) => ({ ...s, input: val }));

  const selectModel = (id: string) => {
    const modelLimit =
      MODEL_CONTEXT_LIMITS[id] ?? MODEL_CONTEXT_LIMITS["default"];
    const defaultMaxTokens = Math.floor(modelLimit * 0.6);
    setMaxTokens(defaultMaxTokens);
    setAppState((prev) => ({ ...prev, selectedModel: id }));
    setInputState({ input: "", generatedImage: null, temperature: 0.7 });
    setChatHistory([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedModel || !input.trim()) return;

    const handler = handlerMap[category];
    if (!handler) {
      setError("Unsupported category");
      return;
    }

    try {
      setStatus((s) => ({ ...s, loading: true }));
      await handler();
    } catch (err) {
      console.error(`${category} job error:`, err);
      setError(`Failed to run ${category} job.`);
    } finally {
      setStatus((s) => ({ ...s, loading: false }));
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

  const renderInterface = () => {
    if (!selectedModel) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500 text-center">
          <div className="animate-pulse text-lg">Loading models...</div>
        </div>
      );
    }

    switch (category) {
      case "image":
        return (
          <ImageInterface
            input={input}
            loading={loading}
            generatedImage={generatedImage}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onReset={resetImage}
            onDownload={handleDownload}
          />
        );
      case "webSearch":
        return (
          <WebSearchInterface
            input={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={loading}
            results={webResults}
            relatedQueries={relatedQueries}
            setWebResults={setWebResults}
          />
        );
      default:
        return (
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
        );
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
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
        className={`fixed md:static top-0 left-0 h-full w-64 bg-black border-r p-4 z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${
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
          {category !== "webSearch" && (
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              selectModel={selectModel}
            />
          )}
          {category !== "image" && category !== "webSearch" && (
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

        <button
          onClick={() =>
            window.open(
              "https://docs.lilypad.tech/lilypad/developer-resources/ai-model-marketplace/build-a-job-module",
              "_blank"
            )
          }
          className="w-full px-4 py-3 mt-4 bg-[#14C7C3] cursor-pointer font-medium text-black font-medium rounded hover:bg-[#0eafab] transition-colors"
        >
          Add your own model
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto mt-14 md:mt-0">
        {renderInterface()}
      </div>
      {error && (
        <div
          className="fixed right-4 bottom-4 z-50 bg-red-600 text-white px-4 py-3 rounded shadow-md flex items-center justify-between gap-4 animate-slide-in"
          onClick={() => setError("")}
        >
          <span>{error}</span>
          <button className="text-white font-bold cursor-pointer">
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
