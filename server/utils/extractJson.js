const extractJson = async (text) => {
    if (!text) {
        return null;
    }

    try {
        // First, try to clean and extract JSON
        let cleaned = text
            .replace(/^```[a-zA-Z]*\s*/gm, '')
            .replace(/```$/gm, '')
            .replace(/^\s+|\s+$/g, '');

        // Find the first { and last }
        const firstBracket = cleaned.indexOf('{');
        const closeBracket = cleaned.lastIndexOf('}');

        if (firstBracket === -1 || closeBracket === -1) {
            return null;
        }

        let jsonString = cleaned.slice(firstBracket, closeBracket + 1);

        // Try to parse as-is first
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            // If that fails, try to fix common escaping issues
            // Replace unescaped newlines in strings
            jsonString = jsonString.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            
            // Try parsing again
            try {
                return JSON.parse(jsonString);
            } catch (e2) {
                // Last resort: try to find and fix broken strings
                // Look for patterns like "..." with content before the closing quote
                jsonString = jsonString.replace(/("code":\s*")(.*?)(?=","message")/s, (match, p1, p2) => {
                    // Properly escape the HTML content
                    const escaped = p2
                        .replace(/\\/g, '\\\\')  // Escape backslashes first
                        .replace(/"/g, '\\"')    // Escape double quotes
                        .replace(/\n/g, '\\n')   // Escape newlines
                        .replace(/\r/g, '\\r')   // Escape carriage returns
                        .replace(/\t/g, '\\t');  // Escape tabs
                    return p1 + escaped + '","message"';
                });
                
                return JSON.parse(jsonString);
            }
        }
    } catch (error) {
        console.error('Error parsing JSON:', error.message);
        return null;
    }
};

export default extractJson;
