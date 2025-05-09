type Model = {
  id: string;
  created?: number;
  object?: string;
  owned_by?: string;
};

type Props = {
  models: (string | Model)[];
  selectedModel: string;
  selectModel: (modelId: string) => void;
};

export default function ModelSelector({
  models,
  selectedModel,
  selectModel,
}: Props) {
  return (
    <div>
      <h2 className="text-lg text-white font-semibold mb-2">Models</h2>
      <select
        value={selectedModel}
        onChange={(e) => selectModel(e.target.value)}
        className="w-full px-3 py-2 text-sm text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {models?.map((model) => {
          const id = typeof model === "string" ? model : model.id;
          return (
            <option key={id} value={id} title={id}>
              {id}
            </option>
          );
        })}
      </select>
    </div>
  );
}
