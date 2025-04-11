import React from "react";

type Props = {
  category: string;
  setCategory: (cat: string) => void;
};

export default function CategorySelector({ category, setCategory }: Props) {
  const categories = [
    { key: "text", label: "Text-to-Text" },
    { key: "image", label: "Text-to-Image" },
    { key: "webSearch", label: "Web Search" },
    { key: "video", label: "Text-to-Video", disabled: true },
    { key: "imageToText", label: "Image-to-Text", disabled: true },
  ];

  return (
    <div>
      <h2 className="text-lg text-white font-semibold mb-2">Categories</h2>
      <div className="space-y-2">
        <div className="flex flex-col gap-2">
          {categories?.map((cat, i) => {
            const isFirstDisabled =
              cat.disabled && !categories.slice(0, i).some((c) => c.disabled);

            return (
              <React.Fragment key={cat.key}>
                {isFirstDisabled && (
                  <div className="text-lg text-white font-semibold my-2">
                    Coming soon
                  </div>
                )}
                <button
                  disabled={cat.disabled}
                  onClick={() => setCategory(cat.key)}
                  className={`px-4 py-2 rounded border ${
                    category === cat.key
                      ? "bg-[#14C7C3] text-black"
                      : "bg-gray-800"
                  } ${
                    cat.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {cat.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
