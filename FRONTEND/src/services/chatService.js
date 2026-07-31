import api from "../api/axios";


// ==========================================
// GET ALL CHATS
// ==========================================

export const getChats = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get(
        "/chats",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// CREATE CHAT
// ==========================================

export const createChat = async (
    title = "New Chat"
) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        "/chats",
        {
            title,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    /*
        Backend returns:

        {
            message: "...",
            chat: {...}
        }

        Chat.jsx expects only the chat object.
    */

    return response.data.chat;
};


// ==========================================
// GET ONE CHAT
// ==========================================

export const getChatById = async (
    chatId
) => {
    const token = localStorage.getItem("token");

    if (!chatId) {
        throw new Error(
            "Chat ID is required."
        );
    }

    const response = await api.get(
        `/chats/${chatId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// RENAME CHAT
// ==========================================

export const renameChat = async (
    chatId,
    title
) => {
    const token = localStorage.getItem("token");

    const cleanTitle = title?.trim();

    if (!chatId) {
        throw new Error(
            "Chat ID is required."
        );
    }

    if (!cleanTitle) {
        throw new Error(
            "Chat title is required."
        );
    }

    const response = await api.put(
        `/chats/${chatId}`,
        {
            title: cleanTitle,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    /*
        Backend returns:

        {
            message: "...",
            chat: {...}
        }
    */

    return response.data.chat;
};


// ==========================================
// DELETE CHAT
// ==========================================

export const deleteChat = async (
    chatId
) => {
    const token = localStorage.getItem("token");

    if (!chatId) {
        throw new Error(
            "Chat ID is required."
        );
    }

    const response = await api.delete(
        `/chats/${chatId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};