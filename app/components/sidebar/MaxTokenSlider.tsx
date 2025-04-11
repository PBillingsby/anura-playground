type MaxTokenSliderProps = {
  maxTokens: number;
  setMaxTokens: (val: number) => void;
  modelLimit?: number;
};

export default function MaxTokenSlider({
  maxTokens,
  setMaxTokens,
  modelLimit = 16384,
}: MaxTokenSliderProps) {
  return (
    <div className="md:mt-4">
      <h2 className="text-lg text-white font-semibold mb-2">
        Max Tokens: {maxTokens}
      </h2>
      <input
        type="range"
        min={512}
        max={modelLimit}
        step={64}
        value={maxTokens}
        onChange={(e) => setMaxTokens(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>512</span>
        <span>{modelLimit}</span>
      </div>
    </div>
  );
}
