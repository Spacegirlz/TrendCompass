const viralHooks = {
  curiosityGap: [
    "This {thing} changed everything I thought about {topic}",
    "I can't believe {authority} hid this from us",
    "The {number} second test that reveals {outcome}",
    "Nobody talks about how {specific_detail}",
    "What I discovered after {timeframe} will shock you",
    "The hidden truth about {topic} that {authority} doesn't want you to know"
  ],
  
  socialProof: [
    "Why everyone in {place} is doing {thing}",
    "{number}M people tried this - here's what happened",
    "My {role} taught me this one trick",
    "Every {expert_type} knows this but won't tell you",
    "I worked at {company} for {years} - here's the secret",
    "Why {successful_group} always {specific_action}"
  ],
  
  fearBased: [
    "Stop {action} immediately (here's why)",
    "The hidden danger in {common_thing}",
    "{number} signs you're already {negative_outcome}",
    "If you're doing {common_behavior}, watch this first",
    "Why I quit {popular_thing} after {incident}",
    "This mistake is ruining your {important_area}"
  ],
  
  controversy: [
    "Unpopular opinion: {common_belief} is wrong",
    "I'm about to get cancelled for this",
    "Why I disagree with every {expert} about {topic}",
    "{Authority_group} is lying to you about {topic}",
    "The truth about {topic} that pisses everyone off",
    "Why {popular_advice} is actually destroying {outcome}"
  ],

  vulnerability: [
    "I'm embarrassed to admit this but {confession}",
    "This is going to sound crazy but {revelation}",
    "I wish someone told me at {age} that {truth}",
    "My biggest mistake with {topic} was {specific_error}",
    "I almost gave up on {goal} until {turning_point}",
    "The thing I'm most ashamed of about {topic}"
  ],

  experiment: [
    "I tried {specific_method} for {timeframe} and {result}",
    "What happens when you {action} for {duration}",
    "I tested {number} different {methods} - only one worked",
    "30 days of {practice} taught me {lesson}",
    "I spent ${amount} testing {claim} - here's the truth",
    "Watch me {risky_action} so you don't have to"
  ],

  urgency: [
    "If you're {age}, you need to know this NOW",
    "This will be banned soon - save this video",
    "Don't {action} until you watch this",
    "You have {timeframe} to fix this before {consequence}",
    "Last chance to {opportunity} before {deadline}",
    "The window for {action} is closing fast"
  ],

  insider: [
    "POV: You're {age} and just realized {harsh_truth}",
    "What it's really like to {experience}",
    "Behind the scenes of {industry/situation}",
    "Things {profession} never tell you about {topic}",
    "The conversation {authority} doesn't want you to hear",
    "What really happens when {situation}"
  ]
};

const topicKeywords = {
  health: ['doctor', 'medical professionals', 'health industry', 'pharmaceutical companies'],
  fitness: ['trainers', 'gym owners', 'fitness influencers', 'supplement companies'],
  productivity: ['productivity gurus', 'self-help authors', 'life coaches', 'motivational speakers'],
  money: ['financial advisors', 'banks', 'investment firms', 'rich people'],
  relationships: ['dating coaches', 'relationship experts', 'therapists', 'married couples'],
  career: ['HR departments', 'managers', 'career coaches', 'successful people'],
  technology: ['tech companies', 'developers', 'engineers', 'Silicon Valley'],
  lifestyle: ['influencers', 'lifestyle gurus', 'successful people', 'celebrities']
};

function generateViralHook(topic, emotion = 'curiosity', specificDetails = {}) {
  const templates = viralHooks[emotion] || viralHooks.curiosityGap;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Smart replacement based on topic and provided details
  let hook = template;
  
  // Replace placeholders with topic-specific content
  if (hook.includes('{topic}')) {
    hook = hook.replace('{topic}', topic.toLowerCase());
  }
  
  if (hook.includes('{authority}') && specificDetails.authority) {
    hook = hook.replace('{authority}', specificDetails.authority);
  } else if (hook.includes('{authority}')) {
    const authorities = getAuthoritiesForTopic(topic);
    hook = hook.replace('{authority}', authorities[Math.floor(Math.random() * authorities.length)]);
  }
  
  if (hook.includes('{number}') && specificDetails.number) {
    hook = hook.replace('{number}', specificDetails.number);
  } else if (hook.includes('{number}')) {
    const numbers = ['3', '5', '7', '10', '15', '30'];
    hook = hook.replace('{number}', numbers[Math.floor(Math.random() * numbers.length)]);
  }
  
  if (hook.includes('{timeframe}') && specificDetails.timeframe) {
    hook = hook.replace('{timeframe}', specificDetails.timeframe);
  } else if (hook.includes('{timeframe}')) {
    const timeframes = ['30 days', '90 days', '6 months', '1 year', '3 months', '2 weeks'];
    hook = hook.replace('{timeframe}', timeframes[Math.floor(Math.random() * timeframes.length)]);
  }
  
  if (hook.includes('{age}') && specificDetails.age) {
    hook = hook.replace('{age}', specificDetails.age);
  } else if (hook.includes('{age}')) {
    const ages = ['25', '30', '35', '40', '28', '32'];
    hook = hook.replace('{age}', ages[Math.floor(Math.random() * ages.length)]);
  }
  
  // Replace remaining placeholders with generic terms
  hook = hook.replace(/\{[^}]+\}/g, (match) => {
    const placeholder = match.slice(1, -1); // Remove { }
    switch(placeholder) {
      case 'thing': return 'method';
      case 'outcome': return 'result';
      case 'place': return 'Silicon Valley';
      case 'role': return 'mentor';
      case 'common_thing': return 'daily habit';
      case 'action': return 'this';
      case 'common_belief': return 'conventional wisdom';
      case 'expert': return 'expert';
      case 'confession': return 'I was wrong';
      case 'revelation': return 'it works';
      case 'truth': return 'this changes everything';
      case 'goal': return 'success';
      case 'turning_point': return 'I discovered this';
      case 'method': return 'technique';
      case 'result': return 'the results surprised me';
      case 'practice': return 'doing this';
      case 'lesson': return 'something crucial';
      case 'amount': return '500';
      case 'claim': return 'popular theory';
      case 'risky_action': return 'test this';
      case 'consequence': return 'it\'s too late';
      case 'opportunity': return 'try this';
      case 'deadline': return 'everyone catches on';
      case 'harsh_truth': return 'you\'ve been lied to';
      case 'experience': return 'be successful';
      case 'industry': return 'the industry';
      case 'situation': return 'this happens';
      case 'profession': return 'experts';
      default: return placeholder;
    }
  });
  
  return hook;
}

function getAuthoritiesForTopic(topic) {
  const lowerTopic = topic.toLowerCase();
  
  for (const [category, authorities] of Object.entries(topicKeywords)) {
    if (lowerTopic.includes(category)) {
      return authorities;
    }
  }
  
  // Default authorities if no specific match
  return ['experts', 'professionals', 'the industry', 'authorities'];
}

function generateMultipleHooks(topic, count = 5, emotions = ['curiosity', 'controversy', 'fear', 'vulnerability']) {
  const hooks = [];
  
  for (let i = 0; i < count; i++) {
    const emotion = emotions[i % emotions.length];
    const hook = generateViralHook(topic, emotion);
    hooks.push({
      hook,
      emotion,
      viralScore: calculateBasicViralScore(hook)
    });
  }
  
  return hooks.sort((a, b) => b.viralScore - a.viralScore);
}

function calculateBasicViralScore(hook) {
  let score = 50; // Base score
  
  // Bonus points for psychological triggers
  if (hook.toLowerCase().includes('nobody talks about')) score += 15;
  if (hook.match(/\d+ (days|hours|minutes|seconds|months|years)/)) score += 10;
  if (hook.toLowerCase().includes('pov:')) score += 10;
  if (hook.includes('secretly') || hook.includes('hidden')) score += 10;
  if (hook.includes('stopped') || hook.includes('quit')) score += 10;
  if (hook.match(/\$\d+/)) score += 5;
  if (hook.includes('embarrassed') || hook.includes('ashamed')) score += 8;
  if (hook.includes('lying') || hook.includes('scam')) score += 12;
  if (hook.includes('banned') || hook.includes('censored')) score += 8;
  if (hook.length < 70) score += 5; // Shorter titles perform better
  if (hook.includes('I tried') || hook.includes('I tested')) score += 8;
  if (hook.includes('watch me') || hook.includes('follow along')) score += 6;
  
  // Penalty for generic terms
  if (hook.includes('tips') || hook.includes('ways')) score -= 15;
  if (hook.includes('benefits') || hook.includes('advantages')) score -= 10;
  if (hook.includes('how to') && !hook.includes('how to stop')) score -= 8;
  if (hook.includes('amazing') || hook.includes('incredible')) score -= 5;
  
  return Math.min(99, Math.max(10, score));
}

function remixHook(originalHook, newEmotion) {
  // Extract key elements from original hook
  const topic = extractTopicFromHook(originalHook);
  return generateViralHook(topic, newEmotion);
}

function extractTopicFromHook(hook) {
  // Simple extraction - could be improved with NLP
  const words = hook.toLowerCase().split(' ');
  const stopWords = ['i', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'this', 'that', 'these', 'those'];
  const meaningfulWords = words.filter(word => !stopWords.includes(word) && word.length > 3);
  
  // Return first meaningful word or combination
  return meaningfulWords.slice(0, 2).join(' ') || 'general topic';
}

module.exports = {
  generateViralHook,
  generateMultipleHooks,
  calculateBasicViralScore,
  remixHook,
  viralHooks
};
