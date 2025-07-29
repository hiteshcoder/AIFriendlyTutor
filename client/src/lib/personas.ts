import { Persona } from "@shared/schema";

export const PROFESSIONS = [
  "Investment Banker",
  "Medical Professional",
  "Tech Entrepreneur", 
  "Legal Professional",
  "Real Estate Mogul",
  "Sports & Entertainment"
] as const;

export const GENDERS = ["Male", "Female", "Non-binary"] as const;

export const ETHNICITIES = [
  "White",
  "Asian", 
  "Black",
  "Hispanic/Latino",
  "Mixed/Other"
] as const;

export function generatePersonaResponse(persona: Persona, query: string): string {
  // Simple response generation based on persona traits and profession
  const responses = {
    "Investment Banker": [
      "From an investment perspective, this needs to demonstrate clear ROI and market positioning.",
      "The financial metrics and market penetration strategy are crucial considerations here.",
      "I'd need to see the competitive analysis and pricing justification before making a decision."
    ],
    "Medical Professional": [
      "As a healthcare professional, I prioritize practical value over luxury branding.",
      "The cost-benefit analysis doesn't align with my professional spending priorities.",
      "I prefer investments that contribute to my practice or personal well-being directly."
    ],
    "Tech Entrepreneur": [
      "Innovation and cutting-edge technology are what drive my purchasing decisions.",
      "I appreciate products that push boundaries and demonstrate technical excellence.",
      "The scalability and future potential of this technology are impressive."
    ],
    "Legal Professional": [
      "I evaluate purchases based on long-term value and reputation considerations.",
      "Professional image and reliability are paramount in my decision-making process.",
      "The brand's track record and market position influence my confidence level."
    ],
    "Real Estate Mogul": [
      "I view this as another asset class and evaluate it against my property portfolio.",
      "The appreciation potential and exclusivity factor are important considerations.",
      "Luxury purchases should maintain or increase value over time."
    ],
    "Sports & Entertainment": [
      "Performance and status are key factors in my luxury purchase decisions.",
      "I value products that reflect success and personal achievement.",
      "The brand prestige aligns with my public image requirements."
    ]
  };

  const professionResponses = responses[persona.profession as keyof typeof responses] || responses["Investment Banker"];
  return professionResponses[Math.floor(Math.random() * professionResponses.length)];
}

export function calculateSentiment(response: string): { sentiment: 'positive' | 'neutral' | 'negative', confidence: number } {
  const positiveKeywords = ['excellent', 'impressive', 'appreciate', 'value', 'good', 'great', 'amazing', 'outstanding'];
  const negativeKeywords = ['expensive', 'overpriced', 'excessive', 'unnecessary', 'disappointing', 'poor', 'bad', 'waste'];
  
  const lowerResponse = response.toLowerCase();
  const positiveCount = positiveKeywords.filter(word => lowerResponse.includes(word)).length;
  const negativeCount = negativeKeywords.filter(word => lowerResponse.includes(word)).length;
  
  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', confidence: Math.min(90, 60 + (positiveCount * 10)) };
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'negative', confidence: Math.min(90, 60 + (negativeCount * 10)) };
  } else {
    return { sentiment: 'neutral', confidence: 70 };
  }
}
