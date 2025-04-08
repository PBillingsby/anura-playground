"use client";

import { estimateTokenCount } from "@/app/lib/tokens";
import { Textarea, Button } from "../ui";
import { Loader2 } from "lucide-react";

type Props = {
  input: string;
  loading: boolean;
  generatedImage: string | null;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onReset: () => void;
  onDownload: () => void;
};

export default function ImageInterface({
  input,
  loading,
  generatedImage,
  onChange,
  onSubmit,
  onReset,
  onDownload,
}: Props) {
  const tokenCount = estimateTokenCount(input);
  const renderImageResult = () => (
    <div className="flex flex-col items-center justify-center p-4">
      <p className="text-center text-lg font-medium">Generated Image</p>
      <p className="text-center text-md font-medium">&quot;{input}&quot;</p>
      <img
        src={generatedImage!}
        alt="Generated AI Art"
        className="w-full max-w-md border rounded-lg shadow-lg"
      />
      <p className="text-sm text-gray-500 text-center mt-2">
        You can download the image or generate another one.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-md mt-4">
        <Button
          onClick={onDownload}
          className="hidden md:flex border border-white items-center justify-center gap-2"
        >
          <Loader2 className="h-4 w-4" />
          Download Image
        </Button>
        <Button
          onClick={onReset}
          className="border border-white w-full sm:w-auto"
        >
          Generate Another Image
        </Button>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="flex flex-col items-center justify-center p-4 text-center h-full">
      <img
        src="/robofrog.png"
        className="hidden md:block w-40 md:w-60 mb-4"
        alt="RoboFrog"
      />
      <p className="text-gray-500 mb-4 text-md md:text-lg">
        Enter a prompt to generate an image using the selected model.
      </p>
      {loading && (
        <div className="flex justify-center my-8">
          <Loader2 className="h-16 w-16 animate-spin text-gray-400" />
          <span className="sr-only">Generating image...</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="flex-1 overflow-y-auto border border-white rounded-lg mb-2">
        {generatedImage ? renderImageResult() : renderForm()}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 mb-1">
        <Textarea
          value={input}
          onChange={(e) => onChange(e.target.value.replace(/'/g, ""))}
          placeholder="Enter prompt to generate image"
          className="resize-none w-full p-2"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="border border-gray-400 text-white px-4"
        >
          {loading ? "Generating..." : "Generate"}
        </Button>
      </form>
      <div className="text-xs text-gray-500 mb-1">
        Current input: ~{tokenCount} tokens
      </div>
    </div>
  );
}
