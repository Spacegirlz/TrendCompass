const PerplexityService = require('./perplexity');

class ScriptGeneratorService {
    constructor() {
        this.perplexityService = new PerplexityService();
    }

    async generateVideoScript(viralIdea, platform = 'TikTok', duration = '60 seconds') {
        console.log(`Generating script for: ${viralIdea}`);
        
        const prompt = `Create a complete video script for this viral idea: "${viralIdea}"

Platform: ${platform}
Duration: ${duration}

Format as JSON:
{
  "hook": "First 3-5 seconds to grab attention",
  "script": "Complete script with [VISUAL CUES] and timing",
  "cta": "Strong call-to-action",
  "thumbnail_text": "Text overlay for thumbnail",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "engagement_tactics": ["Comment bait", "Share trigger", "Save trigger"]
}

Make it ULTRA-SPECIFIC with:
- Exact words to say in first 3 seconds
- Visual cues in [BRACKETS]
- Timing markers (0:05, 0:15, etc.)
- Psychological hooks that force engagement
- Platform-specific optimization

Example hook formats:
- "If you're scrolling past this, you're missing..."
- "Everyone's doing X wrong, here's the right way..."
- "I tried X so you don't have to..."`;

        try {
            const response = await this.perplexityService.makeRequest({
                model: 'sonar-pro',
                messages: [
                    {
                        role: "system",
                        content: "You are a viral video script writer who creates hooks that stop the scroll and scripts that drive massive engagement."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.8
            });

            const scriptContent = JSON.parse(response.choices[0].message.content);
            
            return {
                success: true,
                script: scriptContent,
                platform: platform,
                duration: duration
            };
            
        } catch (error) {
            console.error('Script generation error:', error);
            throw new Error(`Script generation failed: ${error.message}`);
        }
    }

    async generateMultiplePlatformScripts(viralIdea) {
        const platforms = [
            { name: 'TikTok', duration: '15-60 seconds' },
            { name: 'YouTube Shorts', duration: '60 seconds' },
            { name: 'Instagram Reels', duration: '30 seconds' }
        ];

        const scripts = {};
        
        for (const platform of platforms) {
            try {
                const result = await this.generateVideoScript(viralIdea, platform.name, platform.duration);
                scripts[platform.name.toLowerCase().replace(' ', '_')] = result.script;
            } catch (error) {
                console.error(`Failed to generate ${platform.name} script:`, error);
                scripts[platform.name.toLowerCase().replace(' ', '_')] = null;
            }
        }

        return {
            success: true,
            viral_idea: viralIdea,
            scripts: scripts
        };
    }
}

module.exports = ScriptGeneratorService;