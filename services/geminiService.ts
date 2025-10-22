import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getModel = (modelName: 'gemini-2.5-flash' | 'gemini-2.5-pro') => {
    // In a real app, you might have more complex logic here
    return modelName;
};

export const generateCaption = async (base64Media: string, mimeType: string): Promise<string> => {
    try {
        const model = getModel('gemini-2.5-flash');
        const imagePart = {
            inlineData: {
                data: base64Media,
                mimeType,
            },
        };
        const textPart = {
            text: "Write a short, engaging Instagram caption for this image. Be creative and use a friendly, casual tone. Include a few relevant hashtags."
        };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating caption:", error);
        return "A beautiful moment captured.";
    }
};

export const generateAiComment = async (postCaption: string, existingComments: { user: string, text: string }[]): Promise<string> => {
    try {
        const model = getModel('gemini-2.5-flash');
        const commentsString = existingComments.map(c => `${c.user}: ${c.text}`).join('\n');
        
        const prompt = `You are a user on a social media platform. You are seeing a post with the caption: "${postCaption}".
        
        The current comments are:
        ${commentsString}
        
        Write a new, friendly, and positive comment as if you were another user. Keep it short and natural.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        return response.text.trim().replace(/"/g, ''); // Remove quotes from response
    } catch (error) {
        console.error("Error generating AI comment:", error);
        return "Love this! 😍";
    }
};

export const generateAiReply = async (conversationHistory: { sender: string, text: string }[]): Promise<string> => {
    try {
        const model = getModel('gemini-2.5-flash');
        const historyText = conversationHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
        
        const prompt = `You are roleplaying as a person in a direct message conversation. The conversation so far:
        ${historyText}
        
        Your turn. Write a natural, brief, and friendly reply.`;

        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error generating AI reply:", error);
        return "Sounds good!";
    }
};

export const getChatbotResponse = async (history: ChatMessage[]): Promise<string> => {
    try {
        const model = getModel('gemini-2.5-pro');

        const contents = history.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        // Remove the last message from contents, as it's the new user prompt
        const lastMessage = contents.pop();
        if (!lastMessage || lastMessage.role !== 'user') {
            return "I'm sorry, I didn't get that. Could you repeat?";
        }
        
        const prompt = lastMessage.parts[0].text;

        const chat = ai.chats.create({
            model,
            history: contents,
            config: {
                systemInstruction: "You are Gemini, a helpful and friendly AI assistant for Socialgram. Keep your responses concise and helpful."
            }
        });

        const response = await chat.sendMessage({ message: prompt });
        return response.text.trim();

    } catch (error) {
        console.error("Error getting chatbot response:", error);
        return "Sorry, I'm having a little trouble thinking right now. Please try again later.";
    }
};