/**
 * Advanced Viral Score Predictor
 * Analyzes video titles and content ideas to predict viral potential
 */

const psychologicalTriggers = {
  // High-impact triggers (major viral indicators)
  highImpact: {
    'nobody talks about': 20,
    'secret': 15,
    'hidden': 15,
    'lying': 18,
    'scam': 16,
    'exposed': 17,
    'truth': 14,
    'revealed': 13,
    'banned': 16,
    'censored': 15,
    'shocking': 12,
    'controversial': 14,
    'forbidden': 15
  },
  
  // Emotional triggers
  emotional: {
    'embarrassed': 12,
    'ashamed': 12,
    'regret': 10,
    'mistake': 11,
    'failed': 13,
    'destroyed': 14,
    'ruined': 13,
    'devastated': 12,
    'terrified': 11,
    'obsessed': 10
  },
  
  // Authority/insider triggers
  authority: {
    'doctor': 8,
    'expert': 6,
    'professor': 7,
    'ceo': 9,
    'worked at': 12,
    'insider': 13,
    'industry': 8,
    'professional': 6,
    'specialist': 7
  },
  
  // Time-based urgency
  timeUrgency: {
    'immediately': 8,
    'right now': 9,
    'before it\'s too late': 12,
    'last chance': 11,
    'expires': 10,
    'limited time': 9,
    'ending soon': 8
  },
  
  // Experiment/proof patterns
  experiment: {
    'i tried': 10,
    'i tested': 10,
    'experiment': 9,
    'challenge': 8,
    'for 30 days': 9,
    'for 90 days': 10,
    'results': 7,
    'what happened': 8,
    'watch me': 9
  },
  
  // Controversy/opposition
  controversy: {
    'unpopular opinion': 13,
    'disagree': 10,
    'wrong': 11,
    'myth': 9,
    'vs': 8,
    'against': 9,
    'opposite': 10
  },
  
  // Social proof
  socialProof: {
    'everyone': 6,
    'millions': 8,
    'viral': 7,
    'trending': 6,
    'popular': 5,
    'famous': 6
  }
};

const viralFormats = {
  'pov:': 12,
  'nobody talks about': 18,
  'i can\'t believe': 11,
  'why i stopped': 13,
  'the truth about': 12,
  'what really happens': 10,
  'behind the scenes': 9,
  'this changed everything': 11,
  'watch me': 9,
  'i wish i knew': 10,
  'things they don\'t tell you': 12,
  'reaction': 7,
  'responds to': 6,
  'reacts to': 6
};

const penaltyWords = {
  'tips': -12,
  'ways': -10,
  'benefits': -8,
  'advantages': -8,
  'guide': -6,
  'tutorial': -7,
  'lesson': -5,
  'amazing': -4,
  'incredible': -4,
  'awesome': -3,
  'fantastic': -3,
  'perfect': -4,
  'ultimate': -5,
  'complete': -3,
  'comprehensive': -4
};

function calculateViralScore(title, additionalContext = {}) {
  if (!title || typeof title !== 'string') {
    return { score: 0, breakdown: { error: 'Invalid title' } };
  }
  
  const lowerTitle = title.toLowerCase();
  let score = 45; // Base score (reduced from 50 to be more realistic)
  let breakdown = {
    base: 45,
    psychological: 0,
    format: 0,
    technical: 0,
    penalties: 0,
    bonuses: 0
  };
  
  // Check for psychological triggers
  for (const [category, triggers] of Object.entries(psychologicalTriggers)) {
    for (const [trigger, points] of Object.entries(triggers)) {
      if (lowerTitle.includes(trigger)) {
        score += points;
        breakdown.psychological += points;
      }
    }
  }
  
  // Check for viral formats
  for (const [format, points] of Object.entries(viralFormats)) {
    if (lowerTitle.includes(format)) {
      score += points;
      breakdown.format += points;
    }
  }
  
  // Technical factors
  const technicalFactors = analyzeTechnicalFactors(title);
  score += technicalFactors.score;
  breakdown.technical = technicalFactors.score;
  
  // Apply penalties
  for (const [penaltyWord, penalty] of Object.entries(penaltyWords)) {
    if (lowerTitle.includes(penaltyWord)) {
      score += penalty; // penalty is already negative
      breakdown.penalties += penalty;
    }
  }
  
  // Bonus factors
  const bonuses = calculateBonuses(title, lowerTitle);
  score += bonuses.score;
  breakdown.bonuses = bonuses.score;
  
  // Ensure score stays within reasonable bounds
  const finalScore = Math.min(98, Math.max(5, Math.round(score)));
  
  return {
    score: finalScore,
    breakdown,
    category: getScoreCategory(finalScore),
    recommendations: generateRecommendations(title, finalScore, breakdown),
    technicalDetails: technicalFactors.details,
    bonusDetails: bonuses.details
  };
}

function analyzeTechnicalFactors(title) {
  let score = 0;
  let details = [];
  
  // Length optimization (sweet spot is 40-70 characters)
  const length = title.length;
  if (length >= 40 && length <= 70) {
    score += 8;
    details.push('Optimal length (40-70 chars)');
  } else if (length < 40) {
    score += 3;
    details.push('Short title (good for mobile)');
  } else if (length > 90) {
    score -= 5;
    details.push('Too long (may get cut off)');
  }
  
  // Number presence (specific numbers are clickable)
  const numberMatches = title.match(/\d+/g);
  if (numberMatches) {
    const numberCount = numberMatches.length;
    if (numberCount === 1) {
      score += 6;
      details.push('Contains specific number');
    } else if (numberCount === 2) {
      score += 4;
      details.push('Multiple numbers (good specificity)');
    } else {
      score -= 2;
      details.push('Too many numbers (overwhelming)');
    }
  }
  
  // Time references
  if (title.match(/\d+\s*(days?|weeks?|months?|years?|hours?|minutes?)/i)) {
    score += 7;
    details.push('Contains specific timeframe');
  }
  
  // Money references
  if (title.match(/\$\d+/)) {
    score += 5;
    details.push('Contains specific dollar amount');
  }
  
  // Age references
  if (title.match(/\b(1[8-9]|[2-6][0-9])\b/)) {
    score += 4;
    details.push('Contains age reference');
  }
  
  // Parenthetical additions (often indicate authenticity)
  if (title.includes('(') && title.includes(')')) {
    score += 3;
    details.push('Contains parenthetical detail');
  }
  
  return { score, details };
}

function calculateBonuses(title, lowerTitle) {
  let score = 0;
  let details = [];
  
  // Personal pronouns (authenticity)
  if (lowerTitle.includes('i ') || lowerTitle.includes('my ') || lowerTitle.includes('me ')) {
    score += 6;
    details.push('Personal/authentic tone');
  }
  
  // Question format
  if (title.includes('?')) {
    score += 4;
    details.push('Question format (engaging)');
  }
  
  // Emotional intensity words
  const intensityWords = ['shocking', 'insane', 'crazy', 'wild', 'brutal', 'savage'];
  const hasIntensity = intensityWords.some(word => lowerTitle.includes(word));
  if (hasIntensity) {
    score += 5;
    details.push('High emotional intensity');
  }
  
  // Current events/trending topics
  const trendingWords = ['ai', 'crypto', 'nft', 'tiktok', 'viral', 'trending', '2024', '2025'];
  const hasTrending = trendingWords.some(word => lowerTitle.includes(word));
  if (hasTrending) {
    score += 3;
    details.push('References trending topics');
  }
  
  // Action words
  const actionWords = ['watch', 'see', 'discover', 'learn', 'find out', 'reveal'];
  const hasAction = actionWords.some(word => lowerTitle.includes(word));
  if (hasAction) {
    score += 2;
    details.push('Contains action words');
  }
  
  return { score, details };
}

function getScoreCategory(score) {
  if (score >= 90) return 'Viral Potential (90+)';
  if (score >= 80) return 'High Performance (80-89)';
  if (score >= 70) return 'Good Engagement (70-79)';
  if (score >= 60) return 'Average Performance (60-69)';
  if (score >= 50) return 'Below Average (50-59)';
  return 'Low Performance (<50)';
}

function generateRecommendations(title, score, breakdown) {
  const recommendations = [];
  
  if (score < 60) {
    recommendations.push('Consider using a proven viral format (POV:, Nobody talks about, I tried...)');
  }
  
  if (breakdown.psychological < 10) {
    recommendations.push('Add psychological triggers (secret, hidden, lying, truth)');
  }
  
  if (breakdown.format < 5) {
    recommendations.push('Use a viral format structure');
  }
  
  if (breakdown.penalties < -10) {
    recommendations.push('Remove generic words (tips, ways, benefits, guide)');
  }
  
  if (title.length > 80) {
    recommendations.push('Shorten title for better mobile display');
  }
  
  if (!title.match(/\d+/)) {
    recommendations.push('Add specific numbers or timeframes');
  }
  
  if (!title.toLowerCase().includes('i ')) {
    recommendations.push('Make it more personal (use "I", "my", etc.)');
  }
  
  return recommendations;
}

function batchAnalyzeIdeas(ideas) {
  return ideas.map(idea => {
    if (typeof idea === 'string') {
      return {
        title: idea,
        ...calculateViralScore(idea)
      };
    } else if (idea.title) {
      return {
        ...idea,
        ...calculateViralScore(idea.title)
      };
    }
    return idea;
  }).sort((a, b) => (b.score || 0) - (a.score || 0));
}

function compareIdeas(idea1, idea2) {
  const score1 = calculateViralScore(idea1);
  const score2 = calculateViralScore(idea2);
  
  return {
    idea1: { title: idea1, ...score1 },
    idea2: { title: idea2, ...score2 },
    winner: score1.score > score2.score ? 'idea1' : 'idea2',
    difference: Math.abs(score1.score - score2.score)
  };
}

module.exports = {
  calculateViralScore,
  batchAnalyzeIdeas,
  compareIdeas,
  getScoreCategory
};
