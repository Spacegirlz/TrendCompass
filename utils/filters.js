const contentFilters = {
    // General banned words for public content
    publicBanned: [
        'tribute', 'drain', 'wallet', 'pay', 'obey', 'ruin', 'slave', 'fetish', 
        'sex', 'nude', 'meet', 'session', 'worship', 'submit', 'dominate',
        'cure', 'reverse', 'guarantee', 'miracle', 'instantly', 'permanent'
    ],
    
    // Health-specific banned words (including prostate/keto focus)
    healthBanned: [
        'cure', 'reverse', 'guarantee', 'doctor approved', 'detox', 'miracle',
        'clinical proof', 'medical breakthrough', 'instant results', 'permanent fix',
        'spot reduce', 'melt fat', 'burns fat', 'melts away', 'eliminates',
        'proven cure', 'medical claims', 'FDA approved'
    ],
    
    // Platform-specific restrictions
    platformRestrictions: {
        'Instagram': ['findom', 'paypig', 'cashslave', 'moneyslave'],
        'TikTok': ['findom', 'paypig', 'cashslave', 'moneyslave', 'onlyfans'],
        'YouTube': ['findom', 'paypig', 'explicit'],
        'LinkedIn': ['findom', 'paypig', 'explicit', 'sexual', 'fetish']
    },
    
    // Safe word replacements (for Valentina niche and health content)
    replacements: {
        'tribute': 'vote',
        'drain': 'invest',
        'wallet': 'budget',
        'pay': 'support',
        'obey': 'choose',
        'worship': 'admire',
        'submit': 'defer',
        'dominate': 'lead',
        'cure': 'may help',
        'reverse': 'improve',
        'guarantee': 'may support',
        'instantly': 'gradually',
        'permanent': 'lasting',
        'spot reduce': 'target through comprehensive training',
        'melt fat': 'support fat loss',
        'burns fat': 'supports metabolism'
    }
};

function applyContentFilters(aiContent, userInputs) {
    try {
        const { niche, platforms } = userInputs;
        const platformList = platforms.map(p => p.trim());
        
        // Determine filter rules based on niche
        let bannedWords = [...contentFilters.publicBanned];
        
        if (niche.toLowerCase().includes('health') || niche.toLowerCase().includes('wellness')) {
            bannedWords = [...bannedWords, ...contentFilters.healthBanned];
        }
        
        // Add platform-specific restrictions
        platformList.forEach(platform => {
            if (contentFilters.platformRestrictions[platform]) {
                bannedWords = [...bannedWords, ...contentFilters.platformRestrictions[platform]];
            }
        });
        
        // Filter and replace content
        const filteredContent = { ...aiContent };
        
        if (filteredContent.ideas) {
            filteredContent.ideas = filteredContent.ideas.map(idea => {
                return {
                    ...idea,
                    public: filterTrack(idea.public, bannedWords, true),
                    private: filterTrack(idea.private, bannedWords, false)
                };
            });
        }
        
        // Filter trend ideas table if present
        if (filteredContent.trend_ideas_table) {
            filteredContent.trend_ideas_table = filterText(
                filteredContent.trend_ideas_table,
                bannedWords,
                true
            );
        }
        
        return filteredContent;
        
    } catch (error) {
        console.error('Content filtering error:', error);
        return aiContent; // Return original content if filtering fails
    }
}

function filterTrack(track, bannedWords, isPublic) {
    if (!track) return track;
    
    const filtered = { ...track };
    
    // Filter description
    if (filtered.description) {
        filtered.description = filterText(filtered.description, bannedWords, isPublic);
    }
    
    // Filter hooks
    if (filtered.hooks) {
        filtered.hooks = filtered.hooks.map(hook => 
            filterText(hook, bannedWords, isPublic)
        );
    }
    
    // Filter hashtags (remove banned words completely)
    if (filtered.hashtags) {
        filtered.hashtags = filtered.hashtags.filter(hashtag => {
            const cleanHashtag = hashtag.replace('#', '').toLowerCase();
            return !bannedWords.some(banned => 
                cleanHashtag.includes(banned.toLowerCase())
            );
        });
    }
    
    return filtered;
}

function filterText(text, bannedWords, isPublic) {
    if (!text) return text;
    
    let filteredText = text;
    
    // Apply replacements for public content
    if (isPublic) {
        Object.entries(contentFilters.replacements).forEach(([banned, replacement]) => {
            const regex = new RegExp(`\\b${banned}\\b`, 'gi');
            filteredText = filteredText.replace(regex, replacement);
        });
    }
    
    // Remove sentences containing banned words that don't have replacements
    const sentences = filteredText.split(/[.!?]+/);
    const cleanSentences = sentences.filter(sentence => {
        return !bannedWords.some(banned => 
            sentence.toLowerCase().includes(banned.toLowerCase()) &&
            !contentFilters.replacements[banned.toLowerCase()]
        );
    });
    
    return cleanSentences.join('. ').trim();
}

// Niche-specific rule packs
const nicheRules = {
    health: {
        requirePhrases: ['may help', 'supports', 'could contribute to'],
        avoidClaims: ['guaranteed results', 'medical advice', 'cure'],
        addDisclaimer: 'Consult healthcare professionals for medical advice.'
    },
    
    fitness: {
        emphasize: ['progressive overload', 'consistency', 'proper form'],
        avoid: ['spot reduction', 'instant transformation'],
        addNote: 'Results vary based on individual factors and consistency.'
    },
    
    lifestyle: {
        emphasize: ['luxury choices', 'personal empowerment', 'lifestyle elevation'],
        maintain: 'aspirational tone without explicit content'
    }
};

function applyNicheRules(content, niche) {
    const lowerNiche = niche.toLowerCase();
    
    if (lowerNiche.includes('health') || lowerNiche.includes('wellness')) {
        return applyHealthRules(content);
    } else if (lowerNiche.includes('fitness')) {
        return applyFitnessRules(content);
    } else if (lowerNiche.includes('lifestyle') || lowerNiche.includes('luxury')) {
        return applyLifestyleRules(content);
    }
    
    return content;
}

function applyHealthRules(content) {
    // Add health disclaimers and soften claims
    const rules = nicheRules.health;
    
    if (content.ideas) {
        content.ideas = content.ideas.map(idea => {
            if (idea.public && idea.public.description) {
                idea.public.description = softMedicalClaims(idea.public.description);
            }
            return idea;
        });
    }
    
    return content;
}

function applyFitnessRules(content) {
    // Apply fitness-specific language
    if (content.ideas) {
        content.ideas = content.ideas.map(idea => {
            if (idea.public && idea.public.description) {
                idea.public.description = emphasizeProgression(idea.public.description);
            }
            return idea;
        });
    }
    
    return content;
}

function applyLifestyleRules(content) {
    // Maintain luxury tone while keeping appropriate
    return content;
}

function softMedicalClaims(text) {
    return text
        .replace(/\bcures?\b/gi, 'may support')
        .replace(/\breverse[sd]?\b/gi, 'may help improve')
        .replace(/\bguaranteed?\b/gi, 'potentially')
        .replace(/\bproven to\b/gi, 'studies suggest may');
}

function emphasizeProgression(text) {
    return text
        .replace(/\binstant\b/gi, 'progressive')
        .replace(/\bquick fix\b/gi, 'sustainable approach')
        .replace(/\bspot reduce?\b/gi, 'target through comprehensive training');
}

module.exports = {
    applyContentFilters,
    applyNicheRules,
    contentFilters
};
