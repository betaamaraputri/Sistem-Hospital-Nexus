import { GoogleGenAI, Content, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION, TOOLS } from "../constants";
import { executeMockTool } from "./mockExecutionService";

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      throw new Error("API Key required.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

// We keep a history in memory for this session
let chatHistory: Content[] = [
  { role: "user", parts: [{ text: "System initialization." }] },
  { role: "model", parts: [{ text: "System initialized. Waiting for requests." }] }
];

export const sendChatMessage = async (
  message: string, 
  onToolCall: (toolName: string) => void
): Promise<string> => {
  const ai = getClient();

  // Add user message to history
  chatHistory.push({ role: "user", parts: [{ text: message }] });

  const model = "gemini-2.5-flash"; // Using flash for speed/latency in tool calling

  // 1. First API Call: Send message and see if model wants to call a tool
  let response = await ai.models.generateContent({
    model: model,
    contents: chatHistory,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: TOOLS }],
    },
  });

  let finalResponseText = "";
  
  // Handle potential function calls (Tool Use)
  const candidates = response.candidates;
  if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
    const parts = candidates[0].content.parts;
    
    // Check specifically for function calls
    const functionCalls = parts.filter(part => part.functionCall);

    if (functionCalls.length > 0) {
      // Add the model's request (tool call) to history
      chatHistory.push(candidates[0].content);

      const functionResponses: Part[] = [];

      for (const callPart of functionCalls) {
        const call = callPart.functionCall;
        if (call) {
          onToolCall(call.name); // Notify UI
          
          // Execute Mock Logic
          const result = await executeMockTool(call.name, call.args);
          
          functionResponses.push({
            functionResponse: {
              name: call.name,
              id: call.id,
              response: { result: result }
            }
          });
        }
      }

      // 2. Second API Call: Send tool results back to model
      // We construct a new message part containing the function responses
      const toolResponseMessage: Content = {
        role: "user", // Tool responses are treated as inputs to the model
        parts: functionResponses
      };
      
      chatHistory.push(toolResponseMessage);

      const finalResponse = await ai.models.generateContent({
        model: model,
        contents: chatHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION, 
          tools: [{ functionDeclarations: TOOLS }] 
        }
      });

      finalResponseText = finalResponse.text || "I processed the request but have no further comments.";
      
      // Add final model response to history
      chatHistory.push({ role: "model", parts: [{ text: finalResponseText }] });

    } else {
      // No tool called, just text response
      finalResponseText = response.text || "";
      chatHistory.push({ role: "model", parts: [{ text: finalResponseText }] });
    }
  }

  return finalResponseText;
};

export const resetChat = () => {
  chatHistory = [];
};
