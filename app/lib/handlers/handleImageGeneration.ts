import { InputState, StatusState } from "@/app/types/state";

export const handleImageGeneration = async (
  input: string,
  selectedModel: string,
  setInputState: React.Dispatch<React.SetStateAction<InputState>>,
  setStatus: React.Dispatch<React.SetStateAction<StatusState>>
): Promise<void> => {
  setInputState((prev) => ({ ...prev, generatedImage: null }));
  setStatus((prev) => ({ ...prev, loading: true }));

  try {
    const res = await fetch("/api/run-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: selectedModel, inputValue: input, category: "image" }),
    });

    const data = await res.json();
    setInputState((prev) => ({ ...prev, generatedImage: data.image }));
  } catch (err) {
    console.error("Image generation failed:", err);
  } finally {
    setStatus((prev) => ({ ...prev, loading: false }));
  }
};
