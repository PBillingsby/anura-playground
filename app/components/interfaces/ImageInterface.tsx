"use client";

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
  const renderImageResult = () => (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 p-4">
        <p className="text-center text-lg font-medium">Generated Image</p>
        <p className="text-center text-md font-medium">&quot;{input}&quot;</p>
        <img
          src={generatedImage!}
          alt="Generated AI Art"
          className="w-full max-w-md border rounded-lg shadow-lg"
        />
        <p className="text-sm text-gray-500 text-center">
          You can download the image or generate another one.
        </p>
        <div className="flex flex-col justify-center sm:flex-row gap-3 w-full max-w-md">
          <Button
            onClick={onDownload}
            className="flex border border-white items-center justify-center gap-2"
          >
            <Loader2 className="h-4 w-4" />
            Download Image
          </Button>
        </div>
        <Button
          onClick={onReset}
          className="max-w-md border border-white w-full"
        >
          Generate Another Image
        </Button>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md p-4">
        <img
          src="/robofrog.png"
          className="md:visible hidden w-[200px] max-w-[80%] mx-auto sm:w-[220px] md:w-[300px]"
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
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 border border-white rounded-lg">
        {generatedImage ? renderImageResult() : renderForm()}
      </div>

      <form onSubmit={onSubmit} className="flex items-start space-x-2">
        <div className="flex-1">
          <Textarea
            value={input}
            onChange={(e) => onChange(e.target.value.replace(/'/g, ""))}
            placeholder="Enter prompt to generate image"
            className="resize-none w-full p-2"
            disabled={loading}
          />
        </div>
        <div className="flex items-center my-auto">
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="border border-white flex items-center h-full px-4 my-auto"
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </form>
    </div>
  );
}
