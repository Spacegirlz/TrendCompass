const https = require('https');

class PerplexityService {
    constructor() {
        this.apiKey = process.env.PERPLEXITY_API_KEY;
        this.baseUrl = 'https://api.perplexity.ai/chat/completions';
        this.model = 'sonar-pro';
    }

    async generateTrendingIdeas(topic) {
        console.log(`Generating trending ideas with Perplexity for topic: ${topic}`);
        
        const prompt = `Generate 12+ viral video ideas for "${topic}" using ONLY proven viral patterns that are trending NOW.

MANDATORY VIRAL PATTERNS (use these exact formats):
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

For "${topic}", create SPECIFIC videos using these patterns with current trending angles.

Example format:
✅ "Nobody talks about how your morning routine is secretly sabotaging your productivity"
✅ "I tried working 4 hours a day for 60 days and my income actually doubled"
✅ "POV: You're 25 and just realized hustle culture destroyed your mental health"

CRITICAL: Each title must sound like something a real person would say, not marketing copy.

Format your response as JSON with this exact structure:
{
  "trending_ideas_table": "| # | **Specific Video Title** | **Viral Pattern Used** | **Current Trend Connection** |\\n|---|-------------------------|-------------------------|---------------------|\\n| 1 | \"[Exact clickable title]\" | [Pattern number] | [Why this is trending now] |\\n...",
  "platform_heatmap": "| Video Title | TikTok | YouTube | Instagram |\\n|-------------|--------|---------|-----------|\\n| Title 1 | High | Medium | High |\\n...",
  "unique_insights": "1. Current viral trend insight\\n2. Psychology behind what's working now\\n3. Platform-specific viral mechanics",
  "viral_hashtags": {
    "TikTok": "#trend1 #trend2 #trend3",
    "YouTube": "#keyword1 #keyword2 #keyword3", 
    "Instagram": "#lifestyle1 #lifestyle2 #lifestyle3"
  }
}

FORBIDDEN: Generic categories like "healthy eating tips" or "productivity hacks"
REQUIRED: Specific, clickable titles using proven viral patterns

For platform_heatmap, use "High", "Medium", "Low" to show performance potential.`;

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