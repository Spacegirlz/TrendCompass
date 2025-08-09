const OpenAI = require('openai');
const PerplexityService = require('./perplexity');
const { calculateViralScore, batchAnalyzeIdeas } = require('../utils/viralScore');

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
        
        const prompt = `Generate viral video ideas for "${topic}" using ONLY these proven viral formats:

MANDATORY VIRAL PATTERNS (pick from these):
1. "Nobody talks about [shocking truth]..." 
2. "I tried [specific thing] every day for [X days] and [unexpected result]"
3. "POV: You're [age] and just realized [harsh truth]"
4. "[Expert] reacts to [controversial thing]"
5. "The [specific thing] that [authority] doesn't want you to know"
6. "Why I stopped [common practice] after [specific incident]"
7. "Watch me [do risky thing] so you don't have to"
8. "[Specific group] is lying to you about [topic]"
9. "I can't believe [authority] hid this from us"
10. "This [thing] changed everything I thought about [topic]"
11. "If you're doing [common thing], stop watching and fix this first"
12. "I worked at [place] for [X years], here's what they don't tell you"

For "${topic}", create 12 SPECIFIC videos using these patterns.

Example outputs for "prostate health":
✅ "Nobody talks about how your morning pee tells you everything about your prostate"
✅ "I tried the Japanese prostate exercise for 30 days at age 35"
✅ "POV: You're 28 and your urologist just said 'we need to talk'"
✅ "Doctors are lying to you about prostate supplements (here's proof)"
✅ "Why I stopped drinking coffee after my PSA results came back"

Example outputs for "productivity":
✅ "Nobody talks about why successful people wake up miserable"
✅ "I tried the 4-hour workday for 90 days and almost went broke"
✅ "POV: You're 25 and just realized productivity gurus are scamming you"

FORBIDDEN: Don't give me categories like "Regular Exercise" or "Plant-Based Diets". 
Give me exact video titles people would click immediately.

Each title must:
- Use a specific viral pattern from the list above
- Include specific numbers, ages, or timeframes when relevant
- Sound like something a real person would say, not marketing copy
- Create immediate curiosity or tension
- Be filmable TODAY with basic equipment

Return this exact JSON:
{
  "trending_ideas_table": "| # | **Specific Video Title** | **Viral Pattern Used** | **Hook Type** |",
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
        
        // Add viral scoring to each idea if we can extract them
        if (result.trending_ideas_table) {
            try {
                // Extract video titles from the table for scoring
                const tableRows = result.trending_ideas_table.split('\n').slice(1); // Skip header
                const ideas = tableRows
                    .filter(row => row.trim() && !row.includes('---'))
                    .map(row => {
                        const cells = row.split('|').map(cell => cell.trim());
                        if (cells.length >= 2) {
                            const title = cells[1].replace(/\*\*/g, '').replace(/"/g, '');
                            return title;
                        }
                        return null;
                    })
                    .filter(Boolean);
                
                if (ideas.length > 0) {
                    const scoredIdeas = batchAnalyzeIdeas(ideas);
                    console.log('Added viral scores to ideas:', scoredIdeas.length);
                    
                    // Add viral score summary to the result
                    result.viral_scores = {
                        average_score: Math.round(scoredIdeas.reduce((sum, idea) => sum + (idea.score || 0), 0) / scoredIdeas.length),
                        top_scored: scoredIdeas.slice(0, 3).map(idea => ({
                            title: idea.title,
                            score: idea.score,
                            category: idea.category
                        })),
                        total_analyzed: scoredIdeas.length
                    };
                }
            } catch (scoringError) {
                console.log('Viral scoring failed, continuing without scores:', scoringError.message);
            }
        }
        
        return result;

    } catch (error) {
        console.error('Error generating viral content ideas:', error);
        throw new Error('Failed to generate viral content ideas: ' + error.message);
    }
}

module.exports = {
    generateTrendingIdeas
};