// components/sidebar/TemperatureSlider.tsx
type TemperatureSliderProps = {
  temperature: number;
  setTemperature: (val: number) => void;
};

export default function TemperatureSlider({
  temperature,
  setTemperature,
}: TemperatureSliderProps) {
  return (
    <div className="md:mt-4">
      <h2 className="text-lg text-white font-semibold mb-2">
        Temperature: {temperature.toFixed(2)}
      </h2>
      <input
        type="range"
        min={0}
        max={2}
        step={0.01}
        value={temperature}
        onChange={(e) => setTemperature(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0 - Precise</span>
        <span>2 - Creative</span>
      </div>
    </div>
  );
}
