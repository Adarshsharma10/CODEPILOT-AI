import {
    useRef,
    useState
} from "react";

import {
    sendMessageStream
} from "../services/messageService";


function MessageInput({
    selectedChat,
    onStreamStart,
    onStreamChunk,
    onStreamEnd,
    onFirstMessage,
}) {

    const [content, setContent] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const abortControllerRef =
        useRef(null);


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const handleSend = async () => {

        const message =
            content.trim();


        if (
            !message ||
            !selectedChat ||
            loading
        ) {
            return;
        }


        const controller =
            new AbortController();


        abortControllerRef.current =
            controller;


        setContent("");
        setLoading(true);


        // Immediately show user message
        // and temporary AI bubble.
        onStreamStart(message);


        // Automatic chat title
        if (
            selectedChat.title ===
                "New Chat" &&
            onFirstMessage
        ) {

            onFirstMessage(message);
        }


        try {

            await sendMessageStream(

                selectedChat._id,

                message,

                (chunk) => {

                    console.log(
                        "Passing chunk to ChatWindow:",
                        chunk
                    );

                    onStreamChunk(chunk);
                },

                controller.signal
            );


        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                console.log(
                    "Generation stopped."
                );

            } else {

                console.error(
                    "Message streaming error:",
                    error
                );


                onStreamChunk(
                    "\n\nSorry, something went wrong while generating the response."
                );
            }


        } finally {

            /*
                Only finish this request if
                this controller is still the
                current request.
            */

            if (
                abortControllerRef.current ===
                controller
            ) {

                abortControllerRef.current =
                    null;

                setLoading(false);

                onStreamEnd();
            }
        }
    };


    // ==========================================
    // STOP
    // ==========================================

    const handleStop = () => {

        const controller =
            abortControllerRef.current;


        if (!controller) {
            return;
        }


        controller.abort();

        abortControllerRef.current =
            null;

        setLoading(false);

        onStreamEnd();
    };


    // ==========================================
    // ENTER KEY
    // ==========================================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();
        }
    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="message-input">

            <input
                type="text"

                value={content}

                placeholder={
                    loading
                        ? "CodePilot AI is responding..."
                        : "Ask CodePilot AI anything..."
                }

                onChange={(event) =>
                    setContent(
                        event.target.value
                    )
                }

                onKeyDown={
                    handleKeyDown
                }

                disabled={
                    loading
                }
            />


            {loading ? (

                <button
                    type="button"
                    className="stop-btn"
                    onClick={
                        handleStop
                    }
                >
                    ■ Stop
                </button>

            ) : (

                <button
                    type="button"

                    onClick={
                        handleSend
                    }

                    disabled={
                        !content.trim() ||
                        !selectedChat
                    }
                >
                    Send
                </button>

            )}

        </div>
    );
}


export default MessageInput;