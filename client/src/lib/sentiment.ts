export function analyzeSentiment(text: string): {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
} {
  const positiveKeywords = [
    'excellent', 'amazing', 'outstanding', 'impressive', 'innovative', 
    'valuable', 'quality', 'premium', 'sophisticated', 'elegant',
    'appreciate', 'recommend', 'exceptional', 'superior', 'beneficial'
  ];
  
  const negativeKeywords = [
    'expensive', 'overpriced', 'excessive', 'unnecessary', 'disappointing', 
    'poor', 'inadequate', 'inferior', 'waste', 'overrated',
    'concerning', 'problematic', 'unreliable', 'questionable', 'lacking'
  ];
  
  const neutralKeywords = [
    'average', 'standard', 'typical', 'normal', 'acceptable',
    'reasonable', 'adequate', 'sufficient', 'okay', 'fine'
  ];

  const lowerText = text.toLowerCase();
  
  const positiveMatches = positiveKeywords.filter(word => lowerText.includes(word));
  const negativeMatches = negativeKeywords.filter(word => lowerText.includes(word));
  const neutralMatches = neutralKeywords.filter(word => lowerText.includes(word));
  
  const positiveScore = positiveMatches.length * 2;
  const negativeScore = negativeMatches.length * 2;
  const neutralScore = neutralMatches.length;
  
  let sentiment: 'positive' | 'neutral' | 'negative';
  let confidence: number;
  let keywords: string[];
  
  if (positiveScore > negativeScore && positiveScore > neutralScore) {
    sentiment = 'positive';
    confidence = Math.min(95, 60 + (positiveScore * 5));
    keywords = positiveMatches;
  } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
    sentiment = 'negative';
    confidence = Math.min(95, 60 + (negativeScore * 5));
    keywords = negativeMatches;
  } else {
    sentiment = 'neutral';
    confidence = Math.max(50, 80 - Math.abs(positiveScore - negativeScore) * 5);
    keywords = neutralMatches;
  }
  
  return { sentiment, confidence, keywords };
}

export function aggregateSentiments(responses: Array<{ sentiment: string; confidence: number }>) {
  if (responses.length === 0) return { positive: 0, neutral: 0, negative: 0 };
  
  const counts = responses.reduce((acc, response) => {
    acc[response.sentiment as keyof typeof acc]++;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });
  
  const total = responses.length;
  return {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100)
  };
}
