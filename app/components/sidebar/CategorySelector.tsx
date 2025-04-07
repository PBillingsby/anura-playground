type Props = {
  category: string;
  setCategory: (cat: string) => void;
};

export default function CategorySelector({ category, setCategory }: Props) {
  const categories = [
    { key: "text", label: "Text-to-Text" },
    { key: "image", label: "Text-to-Image" },
  ];

  return (
    <div>
      <h2 className="text-lg text-white font-semibold mb-2">Categories</h2>
      <div className="space-y-2">
        {categories.map(({ key, label }) => {
          const isSelected = category === key;
          return (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`block w-full text-left px-3 py-2 rounded transition-colors border cursor-pointer ${
                isSelected
                  ? "bg-black text-white border-[#14C7C3]"
                  : "bg-white text-black border-white hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
