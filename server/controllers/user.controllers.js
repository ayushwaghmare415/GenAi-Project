import { generateResponse } from "../config/openRouter.js";
import extractJson from "../utils/extractJson.js";

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        return res.json(req.user);
    } catch (error) {
        return res.status(500).json({ message: `get current user error: ${error.message}` });
    }
};

export const generatedemo = async (req, res) => {
    try {
        const result = await generateResponse("Return only valid JSON with a single field named \"message\" and the value \"hello\".");
        const data = await extractJson(result);
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

