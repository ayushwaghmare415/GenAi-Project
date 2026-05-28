import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const isAuth = async (req, res, next) => {
    try {
        let token = null;

        // Prefer the explicit Authorization header (from axiosInstance/localStorage)
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.slice(7);
        }

        // Fall back to the cookie token if no bearer token was sent
        if (!token) {
            token = req.cookies?.token;
        }
        
        if (!token) {
            return res.status(401).json({ message: "token not found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: "user not found" });
        }
        
        req.user = user;
        return next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ message: "invalid token" });
    }
};

export default isAuth;