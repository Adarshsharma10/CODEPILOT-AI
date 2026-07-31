import { useState } from "react";

import "../styles/chat.css";


function Sidebar({
    chats = [],
    selectedChat,
    onCreateChat,
    onSelectChat,
    onDeleteChat,
    onRenameChat,
    onLogout,
    creatingChat = false,
}) {

    const [editingId, setEditingId] =
        useState(null);

    const [title, setTitle] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [renamingId, setRenamingId] =
        useState(null);


    // ==========================================
    // START RENAME
    // ==========================================

    const startEditing = (chat) => {

        if (!chat?._id) {
            return;
        }

        setEditingId(chat._id);
        setTitle(chat.title || "");

    };


    // ==========================================
    // CANCEL RENAME
    // ==========================================

    const cancelEditing = () => {

        setEditingId(null);
        setTitle("");
        setRenamingId(null);

    };


    // ==========================================
    // SAVE RENAME
    // ==========================================

    const saveTitle = async (chatId) => {

        const newTitle =
            title.trim();


        if (!newTitle) {

            cancelEditing();

            return;

        }


        /*
            Find the original chat so we don't
            send an unnecessary API request when
            the title wasn't changed.
        */

        const currentChat =
            chats.find(
                (chat) =>
                    chat._id === chatId
            );


        if (
            currentChat &&
            currentChat.title === newTitle
        ) {

            cancelEditing();

            return;

        }


        if (renamingId === chatId) {
            return;
        }


        try {

            setRenamingId(chatId);


            await onRenameChat(
                chatId,
                newTitle
            );


            setEditingId(null);
            setTitle("");


        } catch (error) {

            console.error(
                "Failed to rename chat:",
                error
            );

            alert(
                "Unable to rename chat."
            );


        } finally {

            setRenamingId(null);

        }

    };


    // ==========================================
    // SEARCH
    // ==========================================

    const normalizedSearch =
        search.trim().toLowerCase();


    const filteredChats =
        chats.filter((chat) => {

            const chatTitle =
                chat?.title || "";

            return chatTitle
                .toLowerCase()
                .includes(
                    normalizedSearch
                );

        });


    // ==========================================
    // UI
    // ==========================================

    return (

        <aside className="sidebar">


            {/* ============================== */}
            {/* NEW CHAT */}
            {/* ============================== */}

            <button
                type="button"

                className="new-chat-btn"

                onClick={onCreateChat}

                disabled={creatingChat}
            >

                {
                    creatingChat
                        ? "Creating..."
                        : "+ New Chat"
                }

            </button>


            {/* ============================== */}
            {/* SEARCH */}
            {/* ============================== */}

            <div className="search-container">

                <input
                    type="text"

                    className="search-input"

                    placeholder="Search chats..."

                    value={search}

                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

            </div>


            {/* ============================== */}
            {/* CHAT LIST */}
            {/* ============================== */}

            <div className="chat-list">


                {
                    filteredChats.length === 0 &&
                    (

                        <p className="no-chats">

                            {
                                normalizedSearch
                                    ? "No chats found"
                                    : "No chats yet"
                            }

                        </p>

                    )
                }


                {
                    filteredChats.map(
                        (chat) => (

                            <div
                                key={chat._id}

                                className={
                                    `chat-item ${
                                        selectedChat?._id ===
                                        chat._id
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >


                                {/* ================== */}
                                {/* RENAME INPUT */}
                                {/* ================== */}

                                {
                                    editingId ===
                                    chat._id
                                        ? (

                                            <input
                                                type="text"

                                                className="rename-input"

                                                value={title}

                                                autoFocus

                                                disabled={
                                                    renamingId ===
                                                    chat._id
                                                }

                                                onChange={(e) =>
                                                    setTitle(
                                                        e.target.value
                                                    )
                                                }

                                                onBlur={() => {

                                                    if (
                                                        renamingId !==
                                                        chat._id
                                                    ) {

                                                        saveTitle(
                                                            chat._id
                                                        );

                                                    }

                                                }}

                                                onKeyDown={(e) => {

                                                    if (
                                                        e.key ===
                                                        "Enter"
                                                    ) {

                                                        e.preventDefault();

                                                        saveTitle(
                                                            chat._id
                                                        );

                                                    }


                                                    if (
                                                        e.key ===
                                                        "Escape"
                                                    ) {

                                                        e.preventDefault();

                                                        cancelEditing();

                                                    }

                                                }}
                                            />

                                        )
                                        : (

                                            <span
                                                className="chat-title"

                                                title={
                                                    chat.title
                                                }

                                                onClick={() =>
                                                    onSelectChat(
                                                        chat
                                                    )
                                                }

                                                onDoubleClick={() =>
                                                    startEditing(
                                                        chat
                                                    )
                                                }
                                            >

                                                {
                                                    chat.title ||
                                                    "Untitled Chat"
                                                }

                                            </span>

                                        )
                                }


                                {/* ================== */}
                                {/* DELETE */}
                                {/* ================== */}

                                <button
                                    type="button"

                                    className="delete-chat-btn"

                                    title="Delete chat"

                                    aria-label={
                                        `Delete ${
                                            chat.title ||
                                            "chat"
                                        }`
                                    }

                                    onClick={(e) => {

                                        e.stopPropagation();

                                        onDeleteChat(
                                            chat
                                        );

                                    }}
                                >

                                    🗑

                                </button>

                            </div>

                        )
                    )
                }

            </div>


            {/* ============================== */}
            {/* LOGOUT */}
            {/* ============================== */}

            <button
                type="button"

                className="logout-btn"

                onClick={onLogout}
            >

                Logout

            </button>

        </aside>

    );

}


export default Sidebar;