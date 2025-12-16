import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION_KNOWLEDGE_GRAPH = `You are a world-class cultural historian and museum guide for Badan Warisan Malaysia, specializing in the traditional game "Batu Seremban".
Your task is to provide accurate, engaging, and concise information based on the user's query and grounded in real-time web search results.
- Provide a direct answer to the user's question.
- Your tone should be educational, respectful, and engaging.
- After your main answer, suggest three distinct and interesting follow-up questions that the user might have. Format them clearly under a heading 'Follow-up Questions:'.
- Do not mention that you are using Google Search. Simply present the information.
- Keep the main answer under 120 words.
`;

export const getGroundedKnowledge = async (message: string): Promise<{ text: string; sources: { title: string; uri: string }[]; followUpQuestions: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION_KNOWLEDGE_GRAPH,
      }
    });

    const fullText = response.text ?? "I couldn't retrieve that information right now.";
    
    // Extract sources from grounding metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map(chunk => ({
        title: chunk.web?.title || new URL(chunk.web?.uri || '').hostname,
        uri: chunk.web?.uri || '#',
      }))
      // Filter out potential duplicates
      .filter((source, index, self) => 
        index === self.findIndex((s) => s.uri === source.uri)
      ) || [];
      
    // Extract follow-up questions from the text
    const followUpRegex = /Follow-up Questions:([\s\S]*)/i;
    const followUpMatch = fullText.match(followUpRegex);
    const mainText = fullText.replace(followUpRegex, '').trim();
    
    let followUpQuestions: string[] = [];
    if (followUpMatch && followUpMatch[1]) {
      followUpQuestions = followUpMatch[1].trim().split('\n').map(q => q.replace(/^[-\d.]+\s*/, '').trim()).filter(Boolean);
    }

    return { text: mainText, sources, followUpQuestions };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "An error occurred while consulting the archives. The digital records might be temporarily unavailable.",
      sources: [],
      followUpQuestions: ["Try asking about the game's origin.", "What are the rules for Level 1?"]
    };
  }
};