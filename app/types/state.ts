export type InputState = {
  input: string;
  generatedImage: string | null;
  temperature: number;
};

export type StatusState = {
  loading: boolean;
  tokenCount: number;
  inputTokens: number;
  historyTokens: number;
  showTokenWarning: boolean;
};