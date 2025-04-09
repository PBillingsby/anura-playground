type Props = {
  category: string;
  setCategory: (cat: string) => void;
};

export default function CategorySelector({ category, setCategory }: Props) {
  const categories = [
    { key: "text", label: "Text-to-Text" },
    { key: "image", label: "Text-to-Image" },
    { key: "video", label: "Text-to-Video", disabled: true },
  ];

  return (
    <div>
      <h2 className="text-lg text-white font-semibold mb-2">Categories</h2>
      <div className="space-y-2">
        {categories.map(({ key, label, disabled }) => {
          const isSelected = category === key;

          const baseClasses =
            "block w-full text-left px-3 py-2 rounded transition-colors border";

          const activeClasses = isSelected
            ? "bg-black text-white border-[#14C7C3] hover:bg-white hover:text-black cursor-pointer"
            : "bg-white text-black border-white hover:bg-gray-200 cursor-pointer";

          // Refined disabled state that's more subtle but still distinctive
          const disabledClasses =
            "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed";

          return (
            <div key={key}>
              <button
                onClick={() => !disabled && setCategory(key)}
                disabled={disabled}
                className={`${baseClasses} ${
                  disabled ? disabledClasses : activeClasses
                }`}
              >
                {label}
              </button>
              {disabled && (
                <p className="text-xs text-gray-400 mt-1 ml-1">Coming soon</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
