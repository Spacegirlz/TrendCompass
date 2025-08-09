const OpenAI = require('openai');
const PerplexityService = require('./perplexity');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const perplexityService = new PerplexityService();

async function generateTrendingIdeas(topic, userLanguage = 'en') {
    try {
        console.log(`Generating ultra-specific viral content ideas for: ${topic}`);
        
        // Try Perplexity first (more current and specific content)
        if (process.env.PERPLEXITY_API_KEY) {
            try {
                console.log('Using Perplexity API for trending content generation...');
                const perplexityResult = await perplexityService.generateTrendingIdeas(topic);
                if (perplexityResult.success) {
                    console.log('Successfully generated content with Perplexity API');
                    return perplexityResult;
                }
            } catch (perplexityError) {
                console.log('Perplexity API failed, falling back to OpenAI:', perplexityError.message);
            }
        }
        
        const prompt = `YOU MUST CREATE SPECIFIC VIRAL VIDEO TITLES, NOT CATEGORIES.

Topic: "${topic}"

MANDATORY EXAMPLES OF WHAT I WANT:
✅ "I took **saw palmetto** for 30 days at age 28 - shocking **prostate** results (time-lapse)"
✅ "Urologist reacts to viral **prostate** myths 25-year-olds believe"  
✅ "POV: You're 30 and your doctor says your **prostate** is already enlarged"
✅ "5 signs your **prostate** is failing at 25 (doctors won't tell you)"
✅ "**Tribute-for-Toes** Challenges - Finsubs send tribute payments to unlock staged close-up toe pics"

FORBIDDEN RESPONSES:
❌ "Regular Exercise"
❌ "Plant-Based Diets" 
❌ "Stress Reduction"
❌ ANY GENERIC HEALTH CATEGORY

CREATE 12 VIRAL VIDEO TITLES for "${topic}":
Each title must be a complete video someone can film TODAY with:
- Specific numbers/timeframes 
- Shocking claims or angles
- **Bold** key terms
- Viral formats like "I tried X for Y days", "Doctor reacts to", "POV:", "X signs that"

Return this exact JSON:
{
  "trending_ideas_table": "| # | **Specific Video Title** | **Viral Hook Strategy** | **Content Type** |",
  "platform_heatmap": "| Video Title | TikTok | YouTube | Instagram |", 
  "unique_insights": "3 unique filming/content creation insights specific to this topic",
  "viral_hashtags": "trending hashtag lists optimized for each platform"
}`;

        // Try GPT-5 first, fallback to GPT-4o
        let modelToUse = "gpt-5";
        let response;
        
        try {
            response = await openai.chat.completions.create({
                model: "gpt-5",
                messages: [
                    {
                        role: "system",
                        content: "You are a viral content strategist who creates specific, actionable video titles. Never give general categories - only exact video titles someone can film immediately."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" },
                max_completion_tokens: 4000
            });
            console.log('Successfully used GPT-5 for content generation');
        } catch (error) {
            console.log('GPT-5 not available, falling back to GPT-4o:', error.message);
            modelToUse = "gpt-4o";
            response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a viral content strategist who creates specific, actionable video titles. Never give general categories - only exact video titles someone can film immediately."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" },
                max_completion_tokens: 4000
            });
        }

        let messageContent = response.choices[0].message.content;
        console.log('Raw response content length:', messageContent?.length || 0);
        
        if (!messageContent || messageContent.trim() === '') {
            console.log(`Empty response from ${modelToUse}, trying fallback...`);
            if (modelToUse === "gpt-5") {
                console.log('GPT-5 returned empty response, falling back to GPT-4o...');
                const fallbackResponse = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "You are a viral content strategist who creates specific, actionable video titles. Never give general categories - only exact video titles someone can film immediately."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    response_format: { type: "json_object" },
                    max_completion_tokens: 4000
                });
                
                const fallbackContent = fallbackResponse.choices[0].message.content;
                if (!fallbackContent || fallbackContent.trim() === '') {
                    throw new Error('Both GPT-5 and GPT-4o returned empty responses');
                }
                
                console.log('Successfully used GPT-4o fallback for content generation');
                messageContent = fallbackContent;
                modelToUse = "gpt-4o (fallback)";
            } else {
                throw new Error(`Empty response from ${modelToUse} model`);
            }
        }
        
        // Clean up the response and ensure proper bold formatting
        let cleanContent = messageContent ? messageContent.trim() : '';
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/\n?```$/g, '');
        }
        
        // Ensure key terms are properly bolded
        cleanContent = cleanContent.replace(/saw palmetto/g, '**saw palmetto**');
        cleanContent = cleanContent.replace(/\*\*\*\*saw palmetto\*\*\*\*/g, '**saw palmetto**');
        cleanContent = cleanContent.replace(/prostate/g, '**prostate**');
        cleanContent = cleanContent.replace(/\*\*\*\*prostate\*\*\*\*/g, '**prostate**');
        
        let result;
        try {
            result = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Model used:', modelToUse);
            console.error('Cleaned content:', cleanContent);
            throw new Error(`${modelToUse} returned invalid JSON format`);
        }
        
        console.log(`Ultra-specific viral content ideas generated successfully using ${modelToUse}`);
        return result;

    } catch (error) {
        console.error('Error generating viral content ideas:', error);
        throw new Error('Failed to generate viral content ideas: ' + error.message);
    }
}

module.exports = {
    generateTrendingIdeas
};