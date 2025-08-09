const https = require('https');

class PerplexityService {
    constructor() {
        this.apiKey = process.env.PERPLEXITY_API_KEY;
        this.baseUrl = 'https://api.perplexity.ai/chat/completions';
        this.model = 'sonar-pro';
    }

    async generateTrendingIdeas(topic) {
        console.log(`Generating trending ideas with Perplexity for topic: ${topic}`);
        
        const prompt = `Generate 12+ ultra-specific viral content ideas for "${topic}". I need extremely specific video titles that would go viral, not generic categories.

Format your response as JSON with this exact structure:
{
  "trending_ideas_table": "| # | **Specific Video Title** | **Viral Hook Strategy** | **Viral Hashtags** |\\n|---|-------------------------|-------------------------|---------------------|\\n| 1 | \"I tried [specific action] for [timeframe]—here's what happened\" | Experiment reveal | #hashtag1 #hashtag2 |\\n...",
  "platform_heatmap": "| Video Title | TikTok | YouTube | Instagram |\\n|-------------|--------|---------|-----------|\\n| Title 1 | High | Medium | High |\\n...",
  "unique_insights": "1. Insight about current trends\\n2. Insight about viral hooks\\n3. Insight about platform strategies",
  "viral_hashtags": {
    "TikTok": "#trend1 #trend2 #trend3",
    "YouTube": "#keyword1 #keyword2 #keyword3", 
    "Instagram": "#lifestyle1 #lifestyle2 #lifestyle3"
  }
}

Make video titles extremely specific like:
- "I spent $500 on [specific thing] to test if [specific claim] is true"
- "POV: You're [specific role] and [specific situation happens]"
- "I tried [specific method] for [timeframe] and the results shocked everyone"

Use bold formatting with ** around key words. Focus on current viral formats and trending hooks.

For platform_heatmap, use "High", "Medium", "Low" instead of emojis to show performance potential on each platform.`;

        try {
            const response = await this.makeRequest({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a viral content strategist who generates ultra-specific, trending video ideas. Always respond with valid JSON format."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.8,
                top_p: 0.9,
                search_recency_filter: "week",
                return_images: false,
                return_related_questions: false,
                stream: false
            });

            console.log('Successfully used Perplexity for content generation');
            
            // Parse the JSON response
            let parsedContent;
            try {
                parsedContent = JSON.parse(response.choices[0].message.content);
            } catch (parseError) {
                console.log('Failed to parse JSON, attempting to extract JSON from response');
                // Try to extract JSON from markdown code blocks or other formatting
                const content = response.choices[0].message.content;
                const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                                content.match(/(\{[\s\S]*\})/);
                if (jsonMatch) {
                    parsedContent = JSON.parse(jsonMatch[1]);
                } else {
                    throw new Error('Could not extract valid JSON from response');
                }
            }

            return {
                success: true,
                data: parsedContent,
                model_used: 'perplexity-' + this.model
            };
            
        } catch (error) {
            console.error('Perplexity API error:', error);
            throw new Error(`Perplexity generation failed: ${error.message}`);
        }
    }

    async makeRequest(data) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            
            // Set timeout
            const timeout = setTimeout(() => {
                reject(new Error('Request timeout after 30 seconds'));
            }, 30000);
            
            const options = {
                hostname: 'api.perplexity.ai',
                port: 443,
                path: '/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 30000
            };

            const req = https.request(options, (res) => {
                let body = '';
                
                res.on('data', (chunk) => {
                    body += chunk;
                });
                
                res.on('end', () => {
                    clearTimeout(timeout);
                    try {
                        const response = JSON.parse(body);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(response);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${response.error?.message || body}`));
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
            
            req.on('timeout', () => {
                clearTimeout(timeout);
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.write(postData);
            req.end();
        });
    }
}

module.exports = PerplexityService;