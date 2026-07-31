const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // ==========================================
        // 1. GET AUTHORIZATION HEADER
        // ==========================================

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization token is required"
            });
        }


        // ==========================================
        // 2. VALIDATE BEARER FORMAT
        // ==========================================

        const parts =
            authHeader.trim().split(/\s+/);


        if (
            parts.length !== 2 ||
            parts[0].toLowerCase() !== "bearer" ||
            !parts[1]
        ) {
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }


        const token = parts[1];


        // ==========================================
        // 3. CHECK JWT SECRET
        // ==========================================

        if (!process.env.JWT_SECRET) {
            console.error(
                "JWT_SECRET is not configured"
            );

            return res.status(500).json({
                message: "Server configuration error"
            });
        }


        // ==========================================
        // 4. VERIFY TOKEN
        // ==========================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // ==========================================
        // 5. VALIDATE TOKEN PAYLOAD
        // ==========================================

        /*
            Your controllers use:

            req.user.id

            Therefore the JWT must contain an `id`.
        */

        if (!decoded?.id) {
            return res.status(401).json({
                message: "Invalid token payload"
            });
        }


        // ==========================================
        // 6. ATTACH USER TO REQUEST
        // ==========================================

        req.user = decoded;


        // ==========================================
        // 7. CONTINUE
        // ==========================================

        next();

    } catch (error) {

        // Expired JWT
        if (
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message:
                    "Session expired. Please login again."
            });
        }


        // Invalid/malformed JWT
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }


        console.error(
            "Authentication middleware error:",
            error
        );


        return res.status(500).json({
            message: "Authentication failed"
        });
    }
};


module.exports = authMiddleware;