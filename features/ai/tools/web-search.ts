import { tool, jsonSchema } from "ai";

export const webSearch = tool({
  description: "Search the web for current or real-time information that you don't already know",
  inputSchema: jsonSchema<{ query: string }>({
    type: "object",
    properties: {
      query: { type: "string", description: "The search query" },
    },
    required: ["query"],
  }),
  execute: async ({ query }) => {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          max_results: 5,
        }),
      }).then((r) => r.json());

      if (!res.results || res.results.length === 0) {
        return { error: "No results found for this query" };
      }

      return res.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
      }));
    } catch (err) {
      console.error("Web search failed:", err);
      return { error: "Web search failed, please try answering without it" };
    }
  },
});