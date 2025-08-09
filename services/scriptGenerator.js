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

CRITICAL: Write in authentic inner voice - the thoughts people think but don't say out loud. Think like famous hook writers who understand human psychology.

Format as JSON:
{
  "hook": "First 3-5 seconds - raw, authentic thought that stops the scroll",
  "script": "Complete script with [VISUAL CUES] and timing",
  "cta": "Strong call-to-action that feels natural",
  "thumbnail_text": "Text overlay for thumbnail",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "engagement_tactics": ["Comment bait", "Share trigger", "Save trigger"]
}

HOOK REQUIREMENTS:
- Write what someone ACTUALLY thinks, not marketing speak
- Use raw, honest language people use in their heads
- Tap into secret fears, desires, or frustrations
- Make it feel like overhearing a private conversation
- Reference specific details, not generic categories

EXAMPLES OF AUTHENTIC HOOKS (study the pattern):
Topic: Weight Loss → "I'm about to tell you why you're still fat and it's not what you think..."
Topic: Dating → "Every guy thinks this makes him attractive but it actually makes women run..."
Topic: Money → "I found out why I'm broke and it has nothing to do with my salary..."
Topic: Skincare → "Your skincare routine is aging you faster and here's proof..."

For "${viralIdea}" - write a hook that sounds like someone's real internal monologue, not a polished ad.`;

        try {
            const response = await this.perplexityService.makeRequest({
                model: 'sonar-pro',
                messages: [
                    {
                        role: "system",
                        content: "You are a master hook writer who understands human psychology. You write in the authentic inner voice - the raw thoughts people think but don't say out loud. Your hooks sound like overhearing someone's private thoughts, not polished marketing. You study what makes people stop scrolling and tap into secret fears, desires, and frustrations with brutal honesty."
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