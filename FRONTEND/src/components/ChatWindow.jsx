import {
    useEffect,
    useRef,
    useState
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CodeBlock from "./CodeBlock";
import MessageInput from "./MessageInput";

import {
    getMessages
} from "../services/messageService";

import "../styles/chat.css";


function ChatWindow({
    selectedChat,
    onFirstMessage,
}) {

    const [messages, setMessages] =
        useState([]);

    const messagesEndRef =
        useRef(null);


    // ==========================================
    // LOAD CHAT
    // ==========================================

    useEffect(() => {

        if (!selectedChat) {

            setMessages([]);

            return;
        }


        loadMessages();

    }, [selectedChat?._id]);


    // ==========================================
    // AUTO SCROLL
    // ==========================================

    useEffect(() => {

        messagesEndRef.current
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }, [messages]);


    // ==========================================
    // GET MESSAGES
    // ==========================================

    const loadMessages = async () => {

        if (!selectedChat) {
            return;
        }


        try {

            const data =
                await getMessages(
                    selectedChat._id
                );


            setMessages(data);


        } catch (error) {

            console.error(
                "Failed to load messages:",
                error
            );
        }
    };


    // ==========================================
    // STREAM START
    // ==========================================

    const handleStreamStart = (
        content
    ) => {

        const uniqueId =
            Date.now();


        const temporaryUserMessage = {

            _id:
                `temp-user-${uniqueId}`,

            role: "user",

            content,
        };


        const temporaryAssistantMessage = {

            _id:
                "streaming-assistant",

            role: "assistant",

            content: "",
        };


        setMessages((previous) => [

            ...previous,

            temporaryUserMessage,

            temporaryAssistantMessage

        ]);
    };


    // ==========================================
    // STREAM CHUNK
    // ==========================================

    const handleStreamChunk = (
        chunk
    ) => {

        console.log(
            "ChatWindow received:",
            chunk
        );


        setMessages((previous) => {

            return previous.map(
                (message) => {

                    if (
                        message._id !==
                        "streaming-assistant"
                    ) {

                        return message;
                    }


                    return {

                        ...message,

                        content:
                            message.content +
                            chunk
                    };
                }
            );
        });
    };


    // ==========================================
    // STREAM END
    // ==========================================

    const handleStreamEnd = async () => {

        /*
            IMPORTANT:

            Don't immediately reload MongoDB here.

            Keep the streamed message visible.
        */


        setMessages((previous) =>

            previous.filter(
                (message) =>

                    !(
                        message._id ===
                            "streaming-assistant" &&

                        message.content ===
                            ""
                    )
            )
        );
    };


    // ==========================================
    // NO CHAT
    // ==========================================

    if (!selectedChat) {

        return (

            <div className="chat-window">

                <div className="empty-state">

                    <h1>
                        🚀 Welcome to CodePilot AI
                    </h1>

                    <p>
                        Create or select a chat to start coding with AI.
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="chat-window">


            {/* HEADER */}

            <div className="chat-header">

                <h2>
                    {selectedChat.title}
                </h2>

            </div>


            {/* MESSAGES */}

            <div className="messages">


                {messages.length === 0 && (

                    <p className="empty-chat">

                        Start the conversation...

                    </p>
                )}


                {messages.map(
                    (message) => (

                    <div
                        key={
                            message._id
                        }

                        className={
                            `message-row ${message.role}`
                        }
                    >


                        {/* AVATAR */}

                        <div className="avatar">

                            {
                                message.role ===
                                "assistant"

                                    ? "🤖"

                                    : "👤"
                            }

                        </div>


                        {/* MESSAGE */}

                        <div
                            className={
                                `message ${message.role}`
                            }
                        >

                            {
                                message._id ===
                                    "streaming-assistant" &&

                                message.content ===
                                    ""

                                ? (

                                    <div className="typing-indicator">

                                        <span></span>
                                        <span></span>
                                        <span></span>

                                    </div>

                                )

                                : (

                                    <ReactMarkdown

                                        remarkPlugins={[
                                            remarkGfm
                                        ]}

                                        components={{

                                            code({
                                                inline,
                                                className,
                                                children,
                                                ...props
                                            }) {

                                                const match =
                                                    /language-(\w+)/.exec(
                                                        className ||
                                                        ""
                                                    );


                                                if (
                                                    !inline &&
                                                    match
                                                ) {

                                                    return (

                                                        <CodeBlock

                                                            language={
                                                                match[1]
                                                            }

                                                            value={
                                                                String(
                                                                    children
                                                                ).replace(
                                                                    /\n$/,
                                                                    ""
                                                                )
                                                            }

                                                        />
                                                    );
                                                }


                                                return (

                                                    <code
                                                        className={
                                                            className
                                                        }

                                                        {...props}
                                                    >

                                                        {children}

                                                    </code>
                                                );
                                            }
                                        }}
                                    >

                                        {message.content}

                                    </ReactMarkdown>
                                )
                            }

                        </div>

                    </div>

                ))}


                <div
                    ref={
                        messagesEndRef
                    }
                />

            </div>


            {/* INPUT */}

            <MessageInput

                selectedChat={
                    selectedChat
                }

                onStreamStart={
                    handleStreamStart
                }

                onStreamChunk={
                    handleStreamChunk
                }

                onStreamEnd={
                    handleStreamEnd
                }

                onFirstMessage={
                    onFirstMessage
                }

            />

        </div>
    );
}


export default ChatWindow;