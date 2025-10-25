/**
 * MAZ-AI Engine (On-Device + On-Prem Simulation)
 *
 * This service simulates the MAZ-AI Engine as specified in the architecture.
 * It follows a privacy-first, on-device inference model, removing reliance on
 * external cloud-based AI services for core functionality.
 *
 * ---
 *
 * ### MAZ-AI Architecture
 *
 * 1.  **On-Device Inference (Primary):** The application uses lightweight, specialized
 *     models (`.onnx` format) for all AI tasks. These models are executed directly
 *     on the user's device using a runtime like ONNX Runtime or TensorFlow Lite.
 *     This ensures maximum privacy, offline capability, and low latency.
 *
 * 2.  **P2P Model Distribution:** The AI models themselves are small (2-10 MB) and are
 *     distributed securely to clients via the same P2P mechanism used for UI themes.
 *     When a model is updated, clients download, verify, and apply it seamlessly.
 *
 * 3.  **Model Zoo (Specialized Tasks):**
 *     - `AdAssistant.onnx`: A multi-modal model that analyzes an image to extract product
 *       details, suggest a price, and generate a title/description.
 *     - `SemanticSearch.onnx`: A text embedding model that converts search queries into
 *       vectors for advanced, context-aware searching.
 *     - `ModeratorTiny.onnx`: A small, efficient model for detecting inappropriate content
 *       in text fields.
 *
 * 4.  **Optional On-Prem Fallback:** For devices that cannot run the models locally or
 *     for more intensive tasks, the system can optionally fall back to a self-hosted
 *     AI server within the MAZDADY infrastructure. This is a last resort and is not
 *     the primary mode of operation.
 *
 * The functions in this file simulate the output of these on-device models.
 */
import { GoogleGenAI, Type } from "@google/genai";

interface AdGenerationResult {
    title: string;
    description: string;
    suggestedPrice: number;
}

// Simulates running the AdAssistant.onnx model on a product image.
export const generateAdFromImage = async (base64Image: string): Promise<AdGenerationResult> => {
    // This simulates loading the ONNX model and running inference on the device.
    console.log("Simulating on-device inference with AdAssistant.onnx...");
    await new Promise(res => setTimeout(res, 2500)); // On-device is faster than a network call.

    return {
        title: "Vintage Leather Biker Jacket",
        description: "Classic black leather biker jacket in great condition. Features multiple zip pockets and a belted waist. Perfect for a timeless, edgy look. Minimal signs of wear.",
        suggestedPrice: 149.99,
    };
};

// This function is kept for potential future use where a user might want to regenerate just the description.
// It simulates the text-generation part of the AdAssistant.onnx model.
export const generateAdDescription = async (title: string): Promise<string> => {
    console.log("Simulating on-device text generation...");
    await new Promise(res => setTimeout(res, 800));
    return `A compelling and brief product description for a marketplace listing with the title: "${title}". This was generated locally on your device for maximum privacy.`;
};


interface AuctionSuggestions {
    startPrice: number;
    durationHours: number;
    optimalStartTime: string;
}

// Simulates a small model that provides auction strategy tips.
export const generateAuctionSuggestions = async (title: string): Promise<AuctionSuggestions> => {
    console.log("Simulating on-device auction suggestion model...");
    await new Promise(res => setTimeout(res, 500));

    const lowerTitle = title.toLowerCase();
    let startPrice = 50;
    let durationHours = 48;

    if (lowerTitle.includes('console') || lowerTitle.includes('rare')) {
        startPrice = 250;
        durationHours = 72;
    } else if (lowerTitle.includes('jacket') || lowerTitle.includes('guitar')) {
        startPrice = 75;
    }

    const optimalStartTime = new Date(Date.now() + 3600 * 1000 * 2).toISOString();

    return {
        startPrice,
        durationHours,
        optimalStartTime,
    };
};

/**
 * Simulates the `ModeratorTiny.onnx` model to check for prohibited content.
 * @param content The title and description of the ad.
 * @returns An object indicating if the content is safe and a reason if it's not.
 */
export const moderateAdContent = async (content: { title: string; description: string }): Promise<{ isSafe: boolean; reason?: string }> => {
    console.log("Simulating on-device content moderation with ModeratorTiny.onnx...");
    await new Promise(res => setTimeout(res, 300)); // Moderation check is very fast.

    const combinedText = `${content.title.toLowerCase()} ${content.description.toLowerCase()}`;
    const prohibitedKeywords = ['scam', 'fake', 'replica', 'counterfeit', 'prohibited', 'illegal'];

    for (const keyword of prohibitedKeywords) {
        if (combinedText.includes(keyword)) {
            return {
                isSafe: false,
                reason: `Content violates policy: Contains prohibited term "${keyword}".`,
            };
        }
    }

    return { isSafe: true };
};

/**
 * Simulates the `SemanticSearch.onnx` model to convert a query into a vector.
 * @param query The user's search text.
 * @returns A promise that resolves to an array of numbers representing the semantic vector.
 */
export const getSearchVector = async (query: string): Promise<number[]> => {
    console.log(`Simulating on-device vector generation for "${query}" with SemanticSearch.onnx...`);
    await new Promise(res => setTimeout(res, 200));

    // In a real implementation, this would be a high-dimensional vector.
    // We generate a small, deterministic vector based on the query length for simulation.
    const vector = Array.from({ length: 32 }, (_, i) => Math.sin(query.length + i));
    
    console.log("Generated vector:", vector);
    return vector;
};

/**
 * Submits a general query to the Gemini AI for a quick answer.
 * @param prompt The user's question.
 * @returns A promise that resolves to the AI's text response.
 */
export const askAi = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a helpful assistant for the MAZDADY P2P marketplace. Answer user questions concisely and clearly in 1-2 sentences.",
        },
    });
    return response.text;
};

/**
 * Gets intelligent search suggestions from Gemini AI.
 * @param query The user's partial search query.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a search assistant for a P2P marketplace called MAZDADY. Based on the user's partial query "${query}", generate up to 5 relevant and concise search suggestions.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["suggestions"]
                }
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.suggestions || [];
    } catch (error) {
        console.error("Failed to get search suggestions:", error);
        return []; // Return empty array on failure to prevent crashes
    }
};

/**
 * Improves a user's search query using the MAZ-AI QueryRewriter.
 * @param query The original user query.
 * @returns A promise that resolves to the improved query string.
 */
export const rewriteQuery = async (query: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a query rewriter for a P2P marketplace called MAZDADY. Your task is to improve the user's search query for better results. For example, 'موبايل' could become 'هاتف ذكي جديد أو مستعمل'. Keep the rewritten query concise and relevant. The user's query is: "${query}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        rewrittenQuery: { type: Type.STRING }
                    },
                    required: ["rewrittenQuery"]
                }
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.rewrittenQuery || query; 
    } catch (error) {
        console.error("Failed to rewrite query:", error);
        return query; // Return original query on failure
    }
};