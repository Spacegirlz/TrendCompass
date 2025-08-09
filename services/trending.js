const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTrendingIdeas(topic, userLanguage = 'en') {
    try {
        console.log(`Generating trending ideas for topic: ${topic}`);
        
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

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_completion_tokens: 4000
        });

        const result = JSON.parse(response.choices[0].message.content);
        console.log('Trending ideas generated successfully');
        return result;

    } catch (error) {
        console.error('Error generating trending ideas:', error);
        throw new Error('Failed to generate trending ideas: ' + error.message);
    }
}

module.exports = {
    generateTrendingIdeas
};