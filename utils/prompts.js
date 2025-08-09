const moment = require('moment-timezone');

function getNicheGuidelines(niche) {
    const lowerNiche = niche.toLowerCase();
    
    if (lowerNiche.includes('prostate') || lowerNiche.includes('health')) {
        return `
**Health/Prostate Focus:**
- Use "may support," "could help," avoid cure claims
- Focus on lifestyle, diet, exercise approaches
- Include evidence-based language
- Add timeframes like "4-8 weeks with consistency"
- Private track can discuss specific supplements/protocols`;
    }
    
    if (lowerNiche.includes('keto') || lowerNiche.includes('diet')) {
        return `
**Keto/Diet Focus:**
- Emphasize sustainable habits over quick fixes
- Use "supports," "may help with," avoid "burns fat"
- Focus on meal prep, recipes, lifestyle integration
- Private track can include advanced protocols/tracking`;
    }
    
    if (lowerNiche.includes('valentina') || lowerNiche.includes('luxury') || lowerNiche.includes('lifestyle')) {
        return `
**Luxury Lifestyle Focus:**
- Public: shoes, style, choice language ("vote," "choose," "unlock")
- Maintain aspirational luxury tone
- Focus on empowerment and personal choice
- Private track can use stronger language while staying professional`;
    }
    
    if (lowerNiche.includes('fitness')) {
        return `
**Fitness Focus:**
- Emphasize progressive overload and consistency
- Avoid spot-reduction promises
- Focus on form, technique, sustainable habits
- Private track can include advanced training protocols`;
    }
    
    return `
**General Guidelines:**
- Maintain luxury positioning and high-value content
- Public track: platform-safe, aspirational
- Private track: more direct, exclusive insights`;
}

function createUniversalPrompt(userInputs) {
    const {
        name,
        email,
        niche,
        target_audience,
        goal,
        platforms,
        timezone
    } = userInputs;

    const platformList = Array.isArray(platforms) ? platforms : platforms.split(',').map(p => p.trim());
    const currentTime = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss z');

    return `
You are an expert viral content strategist creating a luxury viral strategy playbook. Generate a comprehensive dual-track content strategy with both PUBLIC and PRIVATE versions for each idea.

## USER PROFILE:
- Name: ${name}
- Niche: ${niche}
- Target Audience: ${target_audience}
- Primary Goal: ${goal}
- Platforms: ${platformList.join(', ')}
- Timezone: ${timezone}
- Generated At: ${currentTime}

## CONTENT REQUIREMENTS:

### DUAL-TRACK SYSTEM:
- **PUBLIC TRACK**: Safe for all platforms (Instagram, TikTok, YouTube, etc.)
- **PRIVATE TRACK**: For premium communities, direct messages, and member content

### CONTENT RULES:
1. PUBLIC track must be platform-compliant (no explicit content, medical claims, or banned words)
2. PRIVATE track can be more direct but still legal and professional
3. Auto-detect adult/sensitive niches and adjust accordingly
4. Health niches: Use "may help," "supports," avoid medical claims
5. Fitness: Emphasize progressive overload, avoid spot-reduction promises
6. Lifestyle: Maintain luxury tone with appropriate language

### PLATFORM OPTIMIZATION:
Generate content optimized for: ${platformList.join(', ')}

## REQUIRED JSON OUTPUT FORMAT:

Return ONLY valid JSON with this exact structure:

{
  "trend_ideas_table": "| # | Trend Title | Public Version | Private Members Version |\\n|---|-------------|----------------|-------------------------|\\n| 1 | [Title] | [Public description] | [Private description] |\\n| 2 | [Title] | [Public description] | [Private description] |",
  
  "platform_heatmap_table": "| Platform | Trend 1 | Trend 2 | Trend 3 | Trend 4 | Trend 5 |\\n|----------|---------|---------|---------|---------|---------|\\n| Instagram | 🔥 | ✅ | ⚠️ | 🔥 | ✅ |\\n| TikTok | ✅ | 🔥 | ✅ | ⚠️ | 🔥 |",
  
  "ideas": [
    {
      "title": "Trend Idea Title",
      "public": {
        "description": "Platform-safe description for public posting",
        "hooks": [
          "Hook 1 for public content",
          "Hook 2 for public content", 
          "Hook 3 for public content"
        ],
        "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
      },
      "private": {
        "description": "More direct description for private/premium content",
        "hooks": [
          "Hook 1 for private content",
          "Hook 2 for private content",
          "Hook 3 for private content"
        ],
        "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
      }
    }
  ],
  
  "content_rotation_plan": {
    "schedule": [
      {"day": "Monday", "content_type": "Educational post (Public Track)"},
      {"day": "Tuesday", "content_type": "Behind-scenes (Private Track teaser)"},
      {"day": "Wednesday", "content_type": "Trend reaction (Public Track)"},
      {"day": "Thursday", "content_type": "Premium insight (Private Track)"},
      {"day": "Friday", "content_type": "Community poll (Public Track)"},
      {"day": "Saturday", "content_type": "Lifestyle content (Both tracks)"},
      {"day": "Sunday", "content_type": "Weekly recap (Public Track)"}
    ]
  },
  
  "posting_times": {
    "timezone_used": "${timezone}",
    "public": {
      ${platformList.map(platform => `"${platform}": ["9:00 AM", "1:00 PM", "6:00 PM"]`).join(',\n      ')}
    },
    "private": {
      ${platformList.map(platform => `"${platform}": ["11:00 AM", "3:00 PM", "8:00 PM"]`).join(',\n      ')}
    }
  }
}

## SPECIFIC INSTRUCTIONS:

1. Generate 10-15 viral trend ideas
2. Each idea must have distinct public vs private descriptions
3. Create 3 compelling hooks per track  
4. Include 5-8 relevant hashtags per track
5. Use platform heatmap symbols: 🔥 (high potential), ✅ (good fit), ⚠️ (moderate), ❌ (not recommended)
6. Optimize posting times for ${timezone} timezone
7. Consider ${goal} as primary objective
8. Tailor content for ${target_audience}

## NICHE-SPECIFIC GUIDELINES:
${getNicheGuidelines(niche)}

Focus on ${niche} niche with luxury, high-value positioning. Make content actionable and platform-optimized.

IMPORTANT: Return ONLY the JSON object, no additional text or formatting.
    `.trim();
}

function createNicheSpecificPrompt(niche, basePrompt) {
    const lowerNiche = niche.toLowerCase();
    
    let nicheInstructions = '';
    
    if (lowerNiche.includes('health') || lowerNiche.includes('wellness')) {
        nicheInstructions = `
## HEALTH & WELLNESS SPECIFIC RULES:
- Use "may help," "supports," "could contribute to" instead of "cures" or "guarantees"
- Avoid medical claims and use evidence-style wording
- Include disclaimers about consulting healthcare professionals
- Focus on lifestyle and habit formation
- Use progressive timeframes like "4-8 weeks"
        `;
    } else if (lowerNiche.includes('fitness')) {
        nicheInstructions = `
## FITNESS SPECIFIC RULES:
- Emphasize progressive overload and consistency
- Avoid spot-reduction promises
- Focus on form, technique, and gradual improvement
- Include recovery and nutrition aspects
- Use realistic timeframes for results
        `;
    } else if (lowerNiche.includes('lifestyle') || lowerNiche.includes('luxury')) {
        nicheInstructions = `
## LUXURY LIFESTYLE SPECIFIC RULES:
- Maintain aspirational but achievable tone
- Focus on choice, empowerment, and elevation
- Use sophisticated language
- Emphasize quality over quantity
- Include elements of exclusivity and premium value
        `;
    }
    
    return basePrompt + nicheInstructions;
}

function generateOptimalPostingTimes(timezone, platforms) {
    const times = {
        'Instagram': {
            public: ['9:00 AM', '1:00 PM', '6:00 PM'],
            private: ['11:00 AM', '3:00 PM', '8:00 PM']
        },
        'TikTok': {
            public: ['6:00 AM', '10:00 AM', '7:00 PM'],
            private: ['9:00 AM', '1:00 PM', '9:00 PM']
        },
        'Twitter/X': {
            public: ['8:00 AM', '12:00 PM', '5:00 PM'],
            private: ['10:00 AM', '2:00 PM', '7:00 PM']
        },
        'YouTube': {
            public: ['2:00 PM', '6:00 PM', '8:00 PM'],
            private: ['11:00 AM', '4:00 PM', '9:00 PM']
        },
        'LinkedIn': {
            public: ['8:00 AM', '12:00 PM', '5:00 PM'],
            private: ['10:00 AM', '2:00 PM', '4:00 PM']
        },
        'Reddit': {
            public: ['7:00 AM', '12:00 PM', '8:00 PM'],
            private: ['10:00 AM', '3:00 PM', '10:00 PM']
        }
    };
    
    const result = {
        timezone_used: timezone,
        public: {},
        private: {}
    };
    
    platforms.forEach(platform => {
        if (times[platform]) {
            result.public[platform] = times[platform].public;
            result.private[platform] = times[platform].private;
        } else {
            // Default times for unlisted platforms
            result.public[platform] = ['9:00 AM', '1:00 PM', '6:00 PM'];
            result.private[platform] = ['11:00 AM', '3:00 PM', '8:00 PM'];
        }
    });
    
    return result;
}

module.exports = {
    createUniversalPrompt,
    createNicheSpecificPrompt,
    generateOptimalPostingTimes
};
