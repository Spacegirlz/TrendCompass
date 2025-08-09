const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTrendingIdeas(topic, userLanguage = 'en') {
    try {
        console.log(`Generating specific viral content ideas for: ${topic}`);
        
        const prompt = `You will write in ${userLanguage === 'en' ? 'English' : userLanguage}.

You act as an adept web researcher, surfacing a wealth of promising ideas and information relevant to the user's inquiry about: "${topic}"

You are programmed to consult a diverse array of sources to ensure thoroughness and provide contextually rich, concise summaries.

Output Rules:
You research the web for mind-blowing, currently high-trending ideas regarding the topic "${topic}".

You will provide a minimum of 10 ideas in a beautiful table format.

Every single idea should be a standalone idea — independent of all others.

You will not explain how to implement the idea — only give the idea itself.

You always use bold text in effective places.

Your interaction is short and simple.

You use less text and more bullet points.

You maintain a friendly, helpful demeanor.

Formatting Requirements:
- Idea list → Always in a formatted table with columns: # | Trend Idea | Description
- Highlight → Use bold for emphasis in titles or key words
- Language → Match the user's language exactly

Special Notes:
This GPT is called Viral Trends

You do not provide step-by-step instructions unless explicitly asked.
You aim for clear, engaging brevity — "short and punchy" is the style.

Please provide exactly this JSON format:
{
  "trending_ideas_table": "markdown table with minimum 10 trending ideas",
  "platform_heatmap": "markdown table showing platform performance for each trend",
  "top_3_fastest_growing": "detailed breakdown of the top 3 fastest growing trends",
  "hook_lines": "successful hook lines and formats for the top trends"
}`;

        // Try GPT-5 first, fallback to GPT-4o if not available
        let modelToUse = "gpt-5";
        let response;
        
        try {
            response = await openai.chat.completions.create({
                model: "gpt-5", // Testing GPT-5 availability
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                max_tokens: 4000 // Using max_tokens instead of max_completion_tokens for GPT-5
            });
            console.log('Successfully used GPT-5 for content generation');
        } catch (error) {
            console.log('GPT-5 not available, falling back to GPT-4o:', error.message);
            modelToUse = "gpt-4o";
            response = await openai.chat.completions.create({
                model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                max_tokens: 4000
            });
        }

        const messageContent = response.choices[0].message.content;
        console.log('Raw response content length:', messageContent?.length || 0);
        console.log('Full raw response content:', messageContent);
        
        if (!messageContent || messageContent.trim() === '') {
            throw new Error(`Empty response from ${modelToUse} model`);
        }
        
        // Try to clean up the response if it has markdown formatting
        let cleanContent = messageContent.trim();
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/\n?```$/g, '');
        }
        
        let result;
        try {
            result = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Model used:', modelToUse);
            console.error('Original content:', messageContent);
            console.error('Cleaned content:', cleanContent);
            
            // Try a fallback with GPT-4o if GPT-5 failed
            if (modelToUse === "gpt-5") {
                console.log('GPT-5 JSON parsing failed, trying GPT-4o as backup...');
                const fallbackResponse = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                    max_tokens: 4000
                });
                
                const fallbackContent = fallbackResponse.choices[0].message.content;
                result = JSON.parse(fallbackContent);
                modelToUse = "gpt-4o (fallback)";
            } else {
                throw new Error(`${modelToUse} returned invalid JSON format`);
            }
        }
        
        console.log(`Trending ideas generated successfully using ${modelToUse}`);
        return result;

    } catch (error) {
        console.error('Error generating viral content ideas:', error);
        throw new Error('Failed to generate viral content ideas: ' + error.message);
    }
}

module.exports = {
    generateTrendingIdeas
};