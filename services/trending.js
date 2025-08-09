const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTrendingIdeas(topic, userLanguage = 'en') {
    try {
        console.log(`Generating specific viral content ideas for: ${topic}`);
        
        const prompt = `Act as a viral content creator. I need 12 SPECIFIC video titles that I can film immediately about: "${topic}"

RULES:
- Each must be a complete video title ready for TikTok/YouTube
- Must include specific numbers, time frames, or shocking claims
- Use viral formats like "I tried X for Y days", "Doctor reacts to", "POV:", "X things they don't tell you"
- NO general topics - only specific, filmable content ideas

Examples of what I want:
"I took saw palmetto for 30 days at age 28 - here's what happened to my prostate"
"Urologist reacts to viral prostate myths young men believe"
"POV: You're 25 and your doctor says your prostate is already enlarged"
"5 signs your prostate is failing at 30 (that doctors miss)"

Create 12 titles like these for "${topic}":

Response format (JSON):
{
  "trending_ideas_table": "| # | Video Title | Content Format | Viral Score |",
  "platform_heatmap": "| Title | TikTok | YouTube | Instagram |", 
  "top_3_fastest_growing": "Top 3 titles with filming tips",
  "hook_lines": "Opening lines for top 3 videos"
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system", 
                    content: "You are a viral content strategist. You create specific, actionable video titles that can go viral immediately. Never give general categories - only specific video titles someone can film today."
                },
                {
                    role: "user", 
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 3000,
            temperature: 0.9
        });

        const result = JSON.parse(response.choices[0].message.content);
        console.log('Specific viral content ideas generated successfully');
        return result;

    } catch (error) {
        console.error('Error generating viral content ideas:', error);
        throw new Error('Failed to generate viral content ideas: ' + error.message);
    }
}

module.exports = {
    generateTrendingIdeas
};