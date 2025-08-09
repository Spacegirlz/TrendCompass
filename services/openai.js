const OpenAI = require('openai');
const { createUniversalPrompt } = require('../utils/prompts');
const { applyContentFilters } = require('../utils/filters');

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-fake-key-for-development'
});

async function generateContent(userInputs) {
    try {
        console.log('Generating AI content with inputs:', userInputs);
        
        const prompt = createUniversalPrompt(userInputs);
        
        console.log('Sending request to OpenAI...');
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
                {
                    role: "system",
                    content: "You are an expert viral content strategist and luxury brand consultant. You specialize in creating dual-track content strategies that work for both public platforms and private member communities. Always provide detailed, actionable, and platform-specific recommendations. Return your response as valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8,
            max_tokens: 4000
        });

        console.log('OpenAI response received');
        
        const rawContent = JSON.parse(response.choices[0].message.content);
        
        // Apply content filters based on niche and platforms
        const filteredContent = applyContentFilters(rawContent, userInputs);
        
        console.log('Content filtering applied');
        
        return filteredContent;
        
    } catch (error) {
        console.error('OpenAI API error:', error);
        
        if (error.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please contact support.');
        } else if (error.code === 'invalid_api_key') {
            throw new Error('OpenAI API configuration error. Please contact support.');
        } else if (error.message.includes('JSON')) {
            throw new Error('Content generation failed due to formatting issues. Please try again.');
        } else {
            throw new Error(`Content generation failed: ${error.message}`);
        }
    }
}

module.exports = {
    generateContent
};
