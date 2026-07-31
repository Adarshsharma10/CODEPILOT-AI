import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

import {
    getChats,
    createChat,
    deleteChat,
    renameChat,
} from "../services/chatService";

import "../styles/chat.css";


function Chat() {
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const [loadingChats, setLoadingChats] = useState(true);
    const [creatingChat, setCreatingChat] = useState(false);

    /*
        Prevent an older async request from updating
        state after this page has unmounted.
    */
    const mountedRef = useRef(true);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        mountedRef.current = true;

        loadChats();

        return () => {
            mountedRef.current = false;
        };
    }, []);


    // =====================================================
    // HANDLE AUTH/API ERRORS
    // =====================================================

    const handleAuthError = (error) => {
        const status = error?.response?.status;

        if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/");

            return true;
        }

        return false;
    };


    // =====================================================
    // LOAD CHATS
    // =====================================================

    const loadChats = async () => {
        try {
            setLoadingChats(true);

            const data = await getChats();

            if (!mountedRef.current) {
                return;
            }

            const safeChats = Array.isArray(data)
                ? data
                : [];

            setChats(safeChats);

            /*
                Select the newest chat initially.

                Do not automatically CREATE a chat.
                Empty accounts should simply show the
                welcome screen until New Chat is clicked.
            */
            setSelectedChat(
                safeChats.length > 0
                    ? safeChats[0]
                    : null
            );

        } catch (error) {
            console.error(
                "Failed to load chats:",
                error
            );

            if (!handleAuthError(error)) {
                alert("Unable to load your chats.");
            }

        } finally {
            if (mountedRef.current) {
                setLoadingChats(false);
            }
        }
    };


    // =====================================================
    // CREATE CHAT
    // =====================================================

    const handleCreateChat = async () => {
        /*
            Prevent double-clicking New Chat from
            creating multiple MongoDB documents.
        */
        if (creatingChat) {
            return;
        }

        try {
            setCreatingChat(true);

            const newChat =
                await createChat("New Chat");

            if (!mountedRef.current) {
                return;
            }

            setChats((prev) => [
                newChat,
                ...prev,
            ]);

            setSelectedChat(newChat);

        } catch (error) {
            console.error(
                "Failed to create chat:",
                error
            );

            if (!handleAuthError(error)) {
                alert("Unable to create a new chat.");
            }

        } finally {
            if (mountedRef.current) {
                setCreatingChat(false);
            }
        }
    };


    // =====================================================
    // SELECT CHAT
    // =====================================================

    const handleSelectChat = (chat) => {
        if (!chat?._id) {
            return;
        }

        setSelectedChat(chat);
    };


    // =====================================================
    // DELETE CHAT
    // =====================================================

    const handleDeleteChat = async (chat) => {
        if (!chat?._id) {
            return;
        }

        const confirmDelete = window.confirm(
            `Delete "${chat.title}"?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteChat(chat._id);

            if (!mountedRef.current) {
                return;
            }

            setChats((prev) => {
                const updatedChats = prev.filter(
                    (item) =>
                        item._id !== chat._id
                );

                /*
                    If the currently opened chat was
                    deleted, select another available chat.
                */
                setSelectedChat((current) => {
                    if (
                        current?._id !== chat._id
                    ) {
                        return current;
                    }

                    return updatedChats.length > 0
                        ? updatedChats[0]
                        : null;
                });

                return updatedChats;
            });

        } catch (error) {
            console.error(
                "Failed to delete chat:",
                error
            );

            if (!handleAuthError(error)) {
                alert("Unable to delete chat.");
            }
        }
    };


    // =====================================================
    // RENAME CHAT
    // =====================================================

    const handleRenameChat = async (
        chatId,
        title
    ) => {
        const cleanTitle = title?.trim();

        if (!chatId || !cleanTitle) {
            return null;
        }

        try {
            const updatedChat =
                await renameChat(
                    chatId,
                    cleanTitle
                );

            if (!mountedRef.current) {
                return updatedChat;
            }

            setChats((prev) =>
                prev.map((chat) =>
                    chat._id === chatId
                        ? updatedChat
                        : chat
                )
            );

            setSelectedChat((current) =>
                current?._id === chatId
                    ? updatedChat
                    : current
            );

            return updatedChat;

        } catch (error) {
            console.error(
                "Failed to rename chat:",
                error
            );

            if (!handleAuthError(error)) {
                throw error;
            }

            return null;
        }
    };


    // =====================================================
    // AUTOMATIC TITLE FROM FIRST MESSAGE
    // =====================================================

    const handleFirstMessage = async (
        content
    ) => {
        /*
            Capture the ID immediately.

            selectedChat could change while the
            rename API request is running.
        */
        const chatId = selectedChat?._id;

        if (!chatId) {
            return;
        }

        if (
            selectedChat.title !== "New Chat"
        ) {
            return;
        }

        let newTitle = content?.trim();

        if (!newTitle) {
            return;
        }

        /*
            Keep sidebar titles reasonably short.
        */
        if (newTitle.length > 35) {
            newTitle =
                newTitle.substring(0, 35) +
                "...";
        }

        try {
            await handleRenameChat(
                chatId,
                newTitle
            );

        } catch (error) {
            /*
                Failure to rename should NOT stop
                the actual AI message request.
            */
            console.error(
                "Automatic title generation failed:",
                error
            );
        }
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/", {
            replace: true,
        });
    };


    // =====================================================
    // INITIAL LOADING SCREEN
    // =====================================================

    if (loadingChats) {
        return (
            <div className="chat-page">
                <div className="chat-loading">
                    Loading CodePilot AI...
                </div>
            </div>
        );
    }


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="chat-page">

            <Sidebar
                chats={chats}

                selectedChat={
                    selectedChat
                }

                onCreateChat={
                    handleCreateChat
                }

                onSelectChat={
                    handleSelectChat
                }

                onDeleteChat={
                    handleDeleteChat
                }

                onRenameChat={
                    handleRenameChat
                }

                onLogout={
                    handleLogout
                }

                creatingChat={
                    creatingChat
                }
            />


            <ChatWindow
                selectedChat={
                    selectedChat
                }

                onFirstMessage={
                    handleFirstMessage
                }
            />

        </div>
    );
}


export default Chat;