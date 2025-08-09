const PerplexityService = require('./perplexity');

class ScriptGeneratorService {
    constructor() {
        this.perplexityService = new PerplexityService();
    }

    async generateVideoScript(viralIdea, platform = 'TikTok', duration = '60 seconds') {
        console.log(`Generating script for: ${viralIdea}`);
        
        const prompt = `Write ONLY the first 3-5 seconds of a video about: "${viralIdea}"

Platform: ${platform}

Use one of these psychological patterns:
1. SHOCKING ADMISSION: "I'm embarrassed to admit this but..."
2. CHALLENGE BELIEF: "Everything you know about X is wrong..."
3. URGENT WARNING: "If you're doing X, stop watching and fix this first..."
4. INSIDER SECRET: "I worked at X for 5 years, here's what they don't tell you..."
5. VULNERABLE SHARE: "This is going to sound crazy but..."
6. REALITY CHECK: "Nobody talks about how..."
7. EXPERIMENT REVEAL: "I tried X for Y days and..."
8. AUTHORITY CALLOUT: "Doctors/Experts are lying to you about..."

The hook must:
- Sound like someone's actual thoughts (use "I", "you", "we")
- Reference a specific detail, number, or timeframe
- Create immediate tension that demands resolution
- Use conversational language with minor grammatical imperfections
- Feel like overhearing someone's private confession

GOOD EXAMPLES:
"Okay so I just found out why I've been tired for 3 years and I'm actually pissed..."
"Nobody talks about how your morning routine is secretly sabotaging your productivity..."
"I'm embarrassed to admit this but I spent $2000 testing productivity apps and only one actually worked..."
"If you're drinking coffee first thing in the morning, stop watching and fix this first..."

BAD EXAMPLES (too polished/marketing):
"Today I'm going to share amazing tips..."
"Welcome back to my channel, in this video..."
"Here are the top 5 ways to..."

Format as JSON:
{
  "hook": "The opening 3-5 seconds - raw and authentic",
  "hook_type": "Which psychological pattern was used",
  "viral_score": "Rate 1-100 how likely this is to stop the scroll",
  "why_it_works": "Brief explanation of the psychology",
  "thumbnail_text": "Text overlay for thumbnail (max 6 words)",
  "follow_up_lines": ["Next 2-3 lines to maintain engagement"],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}

Write ONLY the opening hook that makes people stop scrolling:`;

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

            let rawContent = response.choices[0].message.content;
            
            // Clean up response - remove markdown code blocks if present
            if (rawContent.includes('```json')) {
                rawContent = rawContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
            }
            if (rawContent.includes('```')) {
                rawContent = rawContent.replace(/```.*?\n/, '').replace(/```\s*$/, '');
            }
            
            const scriptContent = JSON.parse(rawContent.trim());
            
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