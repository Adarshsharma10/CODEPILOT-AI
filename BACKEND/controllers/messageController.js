const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

const {
    generateStreamingResponse
} = require("../services/geminiService");


// =========================================================
// CREATE MESSAGE + STREAM RESPONSE
// =========================================================

const createMessage = async (req, res) => {

    const controller = new AbortController();

    let fullResponse = "";
    let userMessage = null;
    let assistantSaved = false;
    let clientDisconnected = false;


    try {

        const { chatId, content } = req.body;


        // =================================================
        // 1. VALIDATION
        // =================================================

        if (!chatId || !content?.trim()) {

            return res.status(400).json({
                message: "Chat ID and content are required"
            });
        }


        // =================================================
        // 2. VERIFY CHAT
        // =================================================

        const chat = await Chat.findOne({
            _id: chatId,
            user: req.user.id
        });


        if (!chat) {

            return res.status(404).json({
                message: "Chat not found"
            });
        }


        // =================================================
        // 3. SAVE USER MESSAGE
        // =================================================

        userMessage = await Message.create({
            chat: chatId,
            role: "user",
            content: content.trim(),
            status: "pending"
        });


        // =================================================
        // 4. LOAD CONVERSATION HISTORY
        // =================================================

        const recentMessages = await Message.find({

            chat: chatId,

            $or: [
                {
                    _id: userMessage._id
                },
                {
                    status: "completed"
                },
                {
                    status: {
                        $exists: false
                    }
                }
            ]

        })
            .sort({
                createdAt: -1
            })
            .limit(20)
            .lean();


        recentMessages.reverse();


        // =================================================
        // 5. STREAMING HEADERS
        // =================================================

        res.status(200);

        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache, no-store, must-revalidate"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.setHeader(
            "X-Accel-Buffering",
            "no"
        );


        /*
            Send headers immediately.

            This tells the browser that the
            streaming response has started.
        */

        res.flushHeaders();


        // =================================================
        // 6. DETECT CLIENT DISCONNECT
        // =================================================

        req.on("aborted", () => {

            clientDisconnected = true;

            if (!controller.signal.aborted) {
                controller.abort();
            }
        });


        res.on("close", () => {

            /*
                close also fires after a normal response,
                so only treat it as cancellation when
                response hasn't finished.
            */

            if (
                !res.writableEnded &&
                !clientDisconnected
            ) {

                clientDisconnected = true;

                if (!controller.signal.aborted) {
                    controller.abort();
                }
            }
        });


        // =================================================
        // 7. START GEMINI STREAM
        // =================================================

        console.log(
            "Starting Gemini stream..."
        );


        const stream =
            await generateStreamingResponse(
                recentMessages,
                controller.signal
            );


        // =================================================
        // 8. READ GEMINI CHUNKS
        // =================================================

        for await (const chunk of stream) {

            if (
                clientDisconnected ||
                controller.signal.aborted
            ) {
                break;
            }


            const text = chunk.text;


            if (!text) {
                continue;
            }


            fullResponse += text;


            console.log(
                "Gemini chunk:",
                JSON.stringify(
                    text.substring(0, 60)
                )
            );


            // =============================================
            // SEND DIRECTLY TO BROWSER
            // =============================================

            if (
                !res.destroyed &&
                !res.writableEnded
            ) {

                res.write(text);
            }
        }


        // =================================================
        // 9. STOPPED BY USER
        // =================================================

        if (
            clientDisconnected ||
            controller.signal.aborted
        ) {

            console.log(
                "Generation stopped."
            );


            if (userMessage) {

                await Message.findByIdAndUpdate(
                    userMessage._id,
                    {
                        status: "stopped"
                    }
                );
            }


            // Save partial response
            if (
                fullResponse.trim() &&
                !assistantSaved
            ) {

                await Message.create({
                    chat: chatId,
                    role: "assistant",
                    content: fullResponse.trim(),
                    status: "completed"
                });


                assistantSaved = true;
            }


            return;
        }


        // =================================================
        // 10. SAVE COMPLETE ASSISTANT RESPONSE
        // =================================================

        if (
            fullResponse.trim() &&
            !assistantSaved
        ) {

            await Message.create({
                chat: chatId,
                role: "assistant",
                content: fullResponse.trim(),
                status: "completed"
            });


            assistantSaved = true;
        }


        // =================================================
        // 11. MARK USER MESSAGE COMPLETED
        // =================================================

        await Message.findByIdAndUpdate(
            userMessage._id,
            {
                status: "completed"
            }
        );


        // =================================================
        // 12. UPDATE CHAT ACTIVITY
        // =================================================

        chat.updatedAt = new Date();

        await chat.save();


        // =================================================
        // 13. END HTTP STREAM
        // =================================================

        if (
            !res.destroyed &&
            !res.writableEnded
        ) {

            res.end();
        }


        console.log(
            "Gemini response completed."
        );


    } catch (error) {

        const aborted =
            controller.signal.aborted ||
            clientDisconnected ||
            error?.name === "AbortError";


        // =================================================
        // ABORTED
        // =================================================

        if (aborted) {

            console.log(
                "Generation cancelled."
            );


            if (userMessage) {

                try {

                    await Message.findByIdAndUpdate(
                        userMessage._id,
                        {
                            status: "stopped"
                        }
                    );

                } catch (updateError) {

                    console.error(
                        "Unable to update stopped message:",
                        updateError
                    );
                }
            }


            // Save partial answer if available
            if (
                fullResponse.trim() &&
                !assistantSaved
            ) {

                try {

                    await Message.create({
                        chat: req.body.chatId,
                        role: "assistant",
                        content: fullResponse.trim(),
                        status: "completed"
                    });

                    assistantSaved = true;

                } catch (saveError) {

                    console.error(
                        "Unable to save partial response:",
                        saveError
                    );
                }
            }


            return;
        }


        // =================================================
        // REAL ERROR
        // =================================================

        console.error(
            "Create Message Error:",
            error
        );


        if (userMessage) {

            try {

                await Message.findByIdAndUpdate(
                    userMessage._id,
                    {
                        status: "stopped"
                    }
                );

            } catch (updateError) {

                console.error(
                    "Unable to update message:",
                    updateError
                );
            }
        }


        if (res.headersSent) {

            if (
                !res.destroyed &&
                !res.writableEnded
            ) {

                res.write(
                    "\n\nSorry, something went wrong while generating the response."
                );

                res.end();
            }

            return;
        }


        return res.status(500).json({
            message:
                "Unable to generate response"
        });
    }
};


// =========================================================
// GET MESSAGES
// =========================================================

const getMessages = async (req, res) => {

    try {

        const { chatId } = req.params;


        const chat = await Chat.findOne({
            _id: chatId,
            user: req.user.id
        });


        if (!chat) {

            return res.status(404).json({
                message: "Chat not found"
            });
        }


        const messages =
            await Message.find({
                chat: chatId
            })
                .sort({
                    createdAt: 1
                });


        return res.status(200).json(
            messages
        );


    } catch (error) {

        console.error(
            "Get Messages Error:",
            error
        );


        if (error.name === "CastError") {

            return res.status(400).json({
                message: "Invalid chat ID"
            });
        }


        return res.status(500).json({
            message:
                "Unable to get messages"
        });
    }
};


module.exports = {
    createMessage,
    getMessages
};