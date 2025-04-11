import { WebSearchResult } from "../../types/websearch";

export const handleWebSearch = async (
  query: string,
  numberOfResults: number,
  setResults: React.Dispatch<React.SetStateAction<WebSearchResult[]>>,
  setRelated: React.Dispatch<React.SetStateAction<string[]>>,
  apiKey: string
): Promise<void> => {
  try {
    const res = await fetch("/api/run-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputValue: query,
        number_of_results: numberOfResults,
        category: "webSearch"
      }),
    });

    if (!res.ok) {
      throw new Error(`Web search failed: ${res.statusText}`);
    }

    const data = await res.json();

    setResults(data.results || []);
    setRelated(data.related_queries || []);
  } catch (err) {
    console.error("Web search error:", err);
    setResults([]);
    setRelated([]);
  }
};
