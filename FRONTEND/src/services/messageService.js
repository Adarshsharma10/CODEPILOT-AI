import api from "../api/axios";


// ==========================================
// API BASE URL
// ==========================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api";


// ==========================================
// GET MESSAGES
// ==========================================

export const getMessages = async (chatId) => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        `/messages/${chatId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// SEND MESSAGE WITH STREAMING
// ==========================================

export const sendMessageStream = async (
    chatId,
    content,
    onChunk,
    signal
) => {

    const token = localStorage.getItem("token");

    const response = await fetch(
    `${import.meta.env.VITE_API_URL}/messages`,
    {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
                chatId,
                content,
            }),

            signal,
        }
    );


    // ======================================
    // HANDLE HTTP ERRORS
    // ======================================

    if (!response.ok) {

        let errorMessage =
            "Failed to send message";

        try {

            const data =
                await response.json();

            errorMessage =
                data.message ||
                errorMessage;

        } catch {
            // Response was not JSON.
        }

        throw new Error(errorMessage);
    }


    // ======================================
    // CHECK STREAM SUPPORT
    // ======================================

    if (!response.body) {

        throw new Error(
            "Streaming response body is unavailable."
        );
    }


    // ======================================
    // READ STREAM
    // ======================================

    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder("utf-8");

    let fullResponse = "";


    try {

        while (true) {

            const {
                done,
                value
            } = await reader.read();


            if (done) {
                break;
            }


            if (!value) {
                continue;
            }


            const text =
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );


            if (!text) {
                continue;
            }


            fullResponse += text;


            if (onChunk) {
                onChunk(text);
            }
        }


        // Flush any remaining decoder data
        const remaining =
            decoder.decode();


        if (remaining) {

            fullResponse += remaining;

            if (onChunk) {
                onChunk(remaining);
            }
        }


        return fullResponse;


    } finally {

        reader.releaseLock();
    }
};