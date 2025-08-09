const OpenAI = require('openai');
const { createUniversalPrompt } = require('../utils/prompts');
const { applyContentFilters } = require('../utils/filters');

// GPT-5 was released August 7, 2025 and is now the most advanced model available
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-fake-key-for-development'
});

async function generateContent(userInputs) {
    try {
        console.log('Generating AI content with GPT-5 inputs:', userInputs);
        
        const prompt = createUniversalPrompt(userInputs);
        
        console.log('Sending request to OpenAI GPT-4o...');
        
        // Try GPT-5 first, fallback to GPT-4o if not available
        let modelToUse = "gpt-5";
        let response;
        
        try {
            response = await openai.chat.completions.create({
                model: "gpt-5", // Testing GPT-5 availability
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
                max_tokens: 4000
            });
            console.log('Successfully used GPT-5 for strategy generation');
        } catch (error) {
            console.log('GPT-5 not available, falling back to GPT-4o:', error.message);
            modelToUse = "gpt-4o";
            response = await openai.chat.completions.create({
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
                max_tokens: 4000
            });
        }

        console.log('OpenAI response received');
        console.log('Raw response content length:', response.choices[0].message.content?.length || 0);
        console.log('Raw response preview:', response.choices[0].message.content?.substring(0, 200) + '...');
        
        const messageContent = response.choices[0].message.content;
        if (!messageContent || messageContent.trim() === '') {
            throw new Error('Empty response from GPT-5');
        }
        
        let rawContent;
        try {
            // Clean the content first
            let cleanContent = messageContent.trim();
            
            // Remove any HTML tags if present (Vercel sometimes returns HTML errors)
            if (cleanContent.includes('<html>') || cleanContent.includes('<!DOCTYPE')) {
                console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
                throw new Error('API returned HTML error page instead of JSON. Please check your API keys and try again.');
            }
            
            // Remove markdown code blocks if present
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/```json\s*/, '').replace(/\s*```$/, '');
            }
            
            rawContent = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Failed to parse content:', messageContent?.substring(0, 500) || 'No content');
            
            // More specific error messages
            if (messageContent?.includes('The page could not be found')) {
                throw new Error('API endpoint not found. Please check your deployment configuration.');
            } else if (messageContent?.includes('Rate limit')) {
                throw new Error('OpenAI API rate limit exceeded. Please try again later.');
            } else if (messageContent?.includes('Invalid API key')) {
                throw new Error('Invalid OpenAI API key. Please check your configuration.');
            } else {
                throw new Error('AI service returned invalid response format. Please try again.');
            }
        }
        
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
