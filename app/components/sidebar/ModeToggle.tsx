import { Message } from "@/app/types/message";

type Props = {
  chatMode: boolean;
  setChatMode: (v: boolean) => void;
  setOutput: (v: string) => void;
  setChatHistory: (v: Message[]) => void;
};

export default function ModeToggle({
  chatMode,
  setChatMode,
  setOutput,
  setChatHistory,
}: Props) {
  return (
    <div>
      <h2 className="text-lg text-white font-semibold mb-2">Interface Mode</h2>
      <div className="space-x-2 flex">
        <button
          onClick={() => {
            setChatMode(false);
            setOutput("");
          }}
          className={`flex-1 px-3 py-2 rounded border cursor-pointer ${
            !chatMode
              ? "bg-black text-white border-[#14C7C3]"
              : "bg-white text-black border-white hover:bg-gray-200"
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => {
            setChatMode(true);
            setChatHistory([]);
          }}
          className={`flex-1 px-3 py-2 rounded border cursor-pointer ${
            chatMode
              ? "bg-black text-white border-[#14C7C3]"
              : "bg-white text-black border-white hover:bg-gray-200"
          }`}
        >
          Chat
        </button>
      </div>
    </div>
  );
}
