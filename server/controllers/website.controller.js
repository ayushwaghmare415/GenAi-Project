import { generateResponse } from "../config/openRouter.js";
import Website from "../model/website.model.js";
import User from "../model/user.model.js";
import extractJson from "../utils/extractJson.js";

// Helper function to generate a unique slug
const generateSlug = (title, timestamp = Date.now()) => {
    const normalized = title
        .toString()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    const base = normalized ? normalized.slice(0, 30) : 'website';
    return `${base}-${timestamp}`;
};

const buildUniqueSlug = async (title) => {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 0;

    while (await Website.exists({ slug })) {
        counter += 1;
        slug = `${baseSlug}-${counter}`;
        if (counter >= 20) {
            slug = `${baseSlug}-${Date.now()}-${counter}`;
            break;
        }
    }

    return slug;
};

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
THIS WEBSITE MUST BE FULLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔ Mobile-first CSS approach
✔ Responsive layout for:
  - Mobile (<768px)
  - Tablet (768px–1024px)
  - Desktop (>1024px)

✔ Use:
  - CSS Grid / Flexbox
  - Relative units (%, rem, vw)
  - Media queries

✔ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stacks on mobile
  - Sections stack vertically on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - No horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE → RESPONSE IS INVALID.

--------------------------------------------------
IMAGES (MANDATORY & RESPONSIVE)
--------------------------------------------------
- Use high-quality images ONLY from:
  https://images.unsplash.com/
- EVERY image URL MUST include:
  ?auto=format&fit=crop&w=1200&q=80

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

--------------------------------------------------
TECHNICAL RULES (VERY IMPORTANT)
--------------------------------------------------
- Output ONE single HTML file
- Exactly ONE <style> tag
- Exactly ONE <script> tag
- NO external CSS / JS / fonts
- Use system fonts only
- iframe srcdoc compatible
- SPA-style navigation using JavaScript
- No page reloads
- No dead UI
- No broken buttons
--------------------------------------------------
SPA VISIBILITY RULE (MANDATORY)
--------------------------------------------------
- Pages MUST NOT be hidden permanently
- If .page { display: none } is used,
  then .page.active { display: block } is REQUIRED
- At least ONE page MUST be visible on initial load
- Hiding all content is INVALID


--------------------------------------------------
REQUIRED SPA PAGES
--------------------------------------------------
- Home
- About
- Services / Features
- Contact

--------------------------------------------------
FUNCTIONAL REQUIREMENTS
--------------------------------------------------
- Navigation must switch pages using JS
- Active nav state must update
- Forms must have JS validation
- Buttons must show hover + active states
- Smooth section/page transitions

--------------------------------------------------
FINAL SELF-CHECK (MANDATORY)
--------------------------------------------------
BEFORE RESPONDING, ENSURE:

1. Layout works on mobile, tablet, desktop
2. No horizontal scroll on mobile
3. All images are responsive
4. All sections adapt properly
5. Media queries are present and used
6. Navigation works on all screen sizes
7. At least ONE page is visible without user interaction

IF ANY CHECK FAILS → RESPONSE IS INVALID

--------------------------------------------------
OUTPUT FORMAT (RAW JSON ONLY)
--------------------------------------------------
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RETURN RAW JSON ONLY
- NO markdown
- NO explanations
- NO extra text
- FORMAT MUST MATCH EXACTLY
- IF FORMAT IS BROKEN → RESPONSE IS INVALID

--------------------------------------------------
JSON ESCAPING (CRITICAL)
--------------------------------------------------
INSIDE the "code" field, you MUST escape:
1. All double quotes as \"
2. All backslashes as \\
3. All newlines as \n
4. All carriage returns as \r
5. All tabs as \t

EXAMPLE (CORRECT):
{
  "message": "Generated a portfolio website",
  "code": "<!DOCTYPE html>\n<html>\n<head>\n<title>My Site<\/title>\n<style>\nbody { font-family: Arial; }\n<\/style>\n<\/head>\n<body>\n<h1>Welcome<\/h1>\n<\/body>\n<\/html>"
}

VERIFY:
- Paste your JSON response into a JSON validator
- It must be 100% valid JSON
- All special characters must be escaped
`;




export const generateWebsite = async (req, res) => {
    try {
        let { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }
        
        prompt = prompt.toString().trim();
        if (!prompt) {
            console.log('generateWebsite validation failed', { body: req.body, user: req.user });
            return res.status(400).json({ message: 'Prompt cannot be empty' });
        }

        // Use user from auth middleware (already verified)
        const user = req.user;
        if (!user) {
            console.log('generateWebsite auth failed', { body: req.body, user: req.user });
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Check if user has enough credits
        const creditsRequired = 50;
        if (!user.credits || user.credits < creditsRequired) {
            console.log('generateWebsite credit failed', { userId: user._id, credits: user.credits });
            return res.status(402).json({
                message: `Insufficient credits. You have ${user.credits || 0} credits but need ${creditsRequired} to generate a website.`
            });
        }
        const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt);
        let raw = "";
        let parsed = null;
        let lastError = null;

        // Try up to 3 times to get valid JSON
        for (let i = 0; i < 3; i++) {
            try {
                // Add stronger JSON enforcement on retries
                const jsonPrompt = i === 0 
                    ? finalPrompt 
                    : i === 1
                    ? finalPrompt + "\n\nIMPORTANT: Return ONLY valid raw JSON. No markdown, no extra text. Ensure all quotes in HTML are properly escaped with backslashes."
                    : finalPrompt + "\n\nRETURN EXACT FORMAT:\n{\n  \"message\": \"string\",\n  \"code\": \"<html>...</html>\"\n}\n\nEnsure ALL quotes in code are escaped as \\\"";
                
                raw = await generateResponse(jsonPrompt);
                
                // Check if response is suspiciously short or long
                if (raw.length < 100) {
                    throw new Error(`Response too short: ${raw}`);
                }
                if (raw.length > 50000) {
                    console.warn(`Response truncated from ${raw.length} to 50000 chars`);
                    raw = raw.slice(0, 50000) + '}'; // Attempt to close JSON
                }
                
                parsed = await extractJson(raw);

                if (parsed && parsed.code) {
                    console.log(`Successfully generated website on attempt ${i + 1}`);
                    break;
                } else {
                    lastError = `Attempt ${i + 1}: Could not extract valid JSON with code field`;
                    console.log(lastError);
                }
            } catch (error) {
                lastError = `Attempt ${i + 1} error: ${error.message}`;
                console.error(lastError);
            }
        }

        if (!parsed || !parsed.code) {
            const errorMsg = lastError || 'Unable to parse generated website code. AI service returned invalid format.';
            console.error('Final error:', errorMsg);
            console.log('Last raw response (first 1000 chars):', raw.slice(0, 1000));
            return res.status(500).json({ message: errorMsg });
        }

        const title = prompt.slice(0, 60) || "Untitled Website";
        const slug = await buildUniqueSlug(title);

        const website = await Website.create({
            user: user._id,
            title,
            slug,
            latestCode: parsed.code,
            conversation: [
                {
                    role: "ai",
                    content: parsed.message || ""
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        })

        user.credits = user.credits - 50;
        await user.save()

        return res.status(201).json({
          website,
          remainingCredits: user.credits
        })
    } catch (error) {
        console.error("Website generation error:", error);
        
        // Provide more specific error messages
        if (error.message.includes("API Error") || error.message.includes("Unauthorized")) {
            return res.status(500).json({ message: "AI service error. Please try again later." });
        }
        
        if (error.message.includes("Cannot read") || error.message.includes("undefined")) {
            return res.status(500).json({ message: "Failed to process AI response. Invalid format received." });
        }
        
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};

export const getWebsiteById = async (req, res) => {
    try {
        console.log('getWebsiteById called with params id=', req.params.id, 'user=', req.user?._id);
        // First try to find the website owned by the authenticated user
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!website) {
            // If not found for this user, check if the document exists at all
            const existing = await Website.findById(req.params.id);
            if (existing) {
                // Document exists but belongs to another user — return 403 Forbidden
                console.warn('Website exists but user mismatch', { requestedBy: req.user._id, owner: existing.user });
                return res.status(403).json({ message: 'You do not have access to this website' });
            }

            return res.status(404).json({ message: 'Website not found' });
        }

        return res.status(200).json({ website });
    } catch (error) {
        return res.status(500).json({ message: `generate website by id error: ${error}` });
    }
}

// Development helper: return a website by id without authentication
export const getWebsitePublic = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ message: 'Not available in production' });
        }

        const website = await Website.findById(req.params.id);
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        return res.status(200).json({ website });
    } catch (error) {
        return res.status(500).json({ message: `public get website error: ${error}` });
    }
}

export const changes = async (req, res) => {
    try {
        const {prompt} = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }
        const websiteId = req.params.id;
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.credits < 25) {
            return res.status(400).json({ message: 'You have not enough credits to generate a website' });
        }

        const updatedPrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

RETURN RAW JSON ONLY:
{
    "message": "Short confirmation",
    "code": "<UPDATED FULL HTML >"
}
`

let raw = "";
let parsed = null;
for (let i = 0; i < 2 && !parsed; i++) {
    raw = await generateResponse(updatedPrompt);
    parsed = await extractJson(raw);

    if (!parsed){
        raw = await generateResponse(updatedPrompt + "\n\nRETURN ONLY RAW JSON.");
        parsed = await extractJson(raw);
    }
}

if (!parsed.code) {
    console.log('ai returned invalid response', raw);
    return res.status(400).json({ message: 'ai returned invalid response. '})
}
        website.conversation.push(
            {role: "user", content: prompt},
            {role: "ai", content: parsed.message}
        )

        website.latestCode = parsed.code;

        await website.save()
        user.credits = user.credits - 50
        await user.save()

        return res.status(200).json({ 
            message: parsed.message,
            conversation: website.conversation,
            latestCode: parsed.code,
            remainingCredits: user.credits
            }) 
        } catch (error) {
            return res.status(500).json({ message: `update website error: ${error}` })
    }
}


export const getAll = async (req, res) => {
    try {
        const websites = await Website.find({ user: req.user._id });
        return res.status(200).json({ websites });
    } catch (error) {
        return res.status(500).json({ message: 'get all websites error: ${error}' });
    }
}

export const deploy = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        if (!website.slug) {
            website.slug = website.title.toLocaleLowerCase().replace(/[^a-z0-9]/g,"").slice(0, 60) + "-" + website._id.toString().slice(-5);
        }

        const origin = req.headers.origin || req.headers.referer || '';
        const frontendBaseUrl = (origin || process.env.FRONTEND_URL || process.env.FRONTENT_URL || 'http://localhost:5173')
          .replace(/\/+$|\/$/, '/')
          .replace(/\/+$/, '/');

        website.deployed = true;
        website.deployUrl = `${frontendBaseUrl}site/${website.slug}`;
        await website.save();
        
        return res.status(200).json({
            url: website.deployUrl
        })
    } catch (error) {
        return res.status(500).json({ message: `deploy website error: ${error}` });
    } 
}

export const getBySlug = async (req, res) => {
    try {
        const website = await Website.findOne({
            slug: req.params.slug,
        })

        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        return res.status(200).json({ website });
    } catch (error) {
        return res.status(500).json({ message: `get website by slug error: ${error}` });
    }
}