const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-3.5-flash-lite";


const SYSTEM_INSTRUCTION = `
You are CodePilot AI, an AI programming assistant.

Your primary purpose is helping users with software development
and computer science.

You are especially good at:
- Programming and debugging
- C, C++, JavaScript, Python and Java
- Data structures and algorithms
- Competitive programming
- React and Node.js
- Express.js
- REST APIs
- MongoDB and SQL
- Git and GitHub
- Machine learning
- System design
- Computer science concepts

When answering programming questions:

1. Give technically correct and practical answers.
2. Explain the approach clearly before complex code.
3. Use Markdown formatting.
4. Put code inside fenced code blocks with the correct language.
5. Mention time and space complexity for algorithms.
6. When debugging, identify the actual problem before fixing it.
7. Never invent APIs, functions, libraries or technical facts.
8. If uncertain, clearly say so.
9. Keep simple questions concise.
10. Give detailed explanations when necessary.

Your name is CodePilot AI.
`;


// ==========================================
// Convert MongoDB messages to Gemini format
// ==========================================

const prepareContents = (messages) => {

    return messages.map((message) => ({
        role:
            message.role === "assistant"
                ? "model"
                : "user",

        parts: [
            {
                text: message.content
            }
        ]
    }));

};


// ==========================================
// Normal response
// ==========================================

const generateResponse = async (messages) => {

    try {

        const contents =
            prepareContents(messages);


        const response =
            await ai.models.generateContent({

                model: MODEL,

                contents,

                config: {
                    systemInstruction:
                        SYSTEM_INSTRUCTION
                }

            });


        return response.text;


    } catch (error) {

        console.error(
            "Gemini Service Error:",
            error
        );

        throw error;

    }

};


// ==========================================
// Streaming response
// ==========================================

const generateStreamingResponse = async (
    messages,
    abortSignal
) => {

    try {

        const contents =
            prepareContents(messages);


        /*
            If the request was already stopped
            before Gemini starts, don't start it.
        */

        if (abortSignal?.aborted) {

            const error =
                new Error(
                    "Generation aborted"
                );

            error.name = "AbortError";

            throw error;

        }


        const stream =
            await ai.models.generateContentStream({

                model: MODEL,

                contents,

                config: {

                    systemInstruction:
                        SYSTEM_INSTRUCTION,

                    /*
                        AbortSignal used by
                        @google/genai HTTP request.
                    */

                    abortSignal:
                        abortSignal

                }

            });


        return stream;


    } catch (error) {

        if (
            error?.name === "AbortError" ||
            abortSignal?.aborted
        ) {

            console.log(
                "Gemini request aborted."
            );

            throw error;

        }


        console.error(
            "Gemini Streaming Error:",
            error
        );

        throw error;

    }

};


module.exports = {
    generateResponse,
    generateStreamingResponse
};