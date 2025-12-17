import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export interface SearchResult {
  domain: string | null;
  sourceUrl: string | null;
}

export const findCompanyDomain = async (
  companyName: string,
  showContext: string
): Promise<SearchResult> => {
  try {
    const ai = getClient();
    
    // Construct a specific prompt to get just the URL or "Not Found"
    const prompt = `
      Task: Find the official website URL (domain) for the company "${companyName}".
      Context: This company is attending the trade show or event: "${showContext}".
      
      Instructions:
      1. Use Google Search to find the official homepage.
      2. Return ONLY the website URL (e.g., https://www.example.com).
      3. If you cannot find a specific website for this company, return "NOT FOUND".
      4. Do not include any explanation, markdown, or extra text. Just the URL.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Low temperature for deterministic output
        temperature: 0.1, 
      },
    });

    const textOutput = response.text ? response.text.trim() : null;
    
    // Extract source URL from grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let sourceUrl: string | null = null;

    if (groundingChunks && groundingChunks.length > 0) {
        // Try to find a web source
        const webChunk = groundingChunks.find((c: any) => c.web?.uri);
        if (webChunk) {
            sourceUrl = webChunk.web.uri;
        }
    }

    let domain = textOutput;
    
    // cleanup common markdown if present
    if (domain?.startsWith('```')) {
      domain = domain.replace(/```\w*\n?|```/g, '').trim();
    }
    
    if (domain === "NOT FOUND" || !domain) {
      return { domain: null, sourceUrl };
    }

    // Basic validation to ensure it looks like a URL
    if (!domain.startsWith('http')) {
       // Sometimes model returns "www.example.com", prepend https
       if (domain.includes('.')) {
         domain = `https://${domain}`;
       }
    }

    return { domain, sourceUrl };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to fetch domain");
  }
};
