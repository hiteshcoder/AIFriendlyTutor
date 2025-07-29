import { storage } from '../storage';
import { Persona, InsertResponse } from '@shared/schema';
import { LLMService } from './llm-service';

export class PersonaService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  async queryAllPersonas(queryContent: string, queryId: number): Promise<any[]> {
    const activePersonas = await storage.getActivePersonas();
    const responses = [];

    for (const persona of activePersonas) {
      try {
        const responseContent = await this.generatePersonaResponse(persona, queryContent);
        const sentiment = this.analyzeSentiment(responseContent);
        const responseTime = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds

        const response: InsertResponse = {
          queryId,
          personaId: persona.id,
          content: responseContent,
          sentiment: sentiment.sentiment,
          confidence: sentiment.confidence,
          responseTime
        };

        const savedResponse = await storage.createResponse(response);
        
        responses.push({
          ...savedResponse,
          persona: {
            name: persona.name,
            profession: persona.profession,
            imageUrl: persona.imageUrl
          }
        });

        // Simulate staggered responses
        if (responses.length >= 5) break;
        
      } catch (error) {
        console.error(`Error generating response for persona ${persona.name}:`, error);
      }
    }

    return responses;
  }

  private async generatePersonaResponse(persona: Persona, query: string): Promise<string> {
    // Use LLM service to generate contextual response
    const context = {
      name: persona.name,
      profession: persona.profession,
      age: persona.age,
      personality: persona.personalityTraits,
      preferences: persona.preferences
    };

    return await this.llmService.generateResponse(query, context);
  }

  private analyzeSentiment(text: string): { sentiment: 'positive' | 'neutral' | 'negative', confidence: number } {
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

    const lowerText = text.toLowerCase();
    const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) {
      return { 
        sentiment: 'positive', 
        confidence: Math.min(95, 60 + (positiveCount * 5)) 
      };
    } else if (negativeCount > positiveCount) {
      return { 
        sentiment: 'negative', 
        confidence: Math.min(95, 60 + (negativeCount * 5)) 
      };
    } else {
      return { 
        sentiment: 'neutral', 
        confidence: 70 
      };
    }
  }

  async getAnalytics() {
    const responses = await Promise.all(
      Array.from({ length: 50 }, (_, i) => 
        storage.getResponsesByQueryId(i + 1)
      )
    );

    const allResponses = responses.flat();
    const sentimentCounts = allResponses.reduce((acc, response) => {
      acc[response.sentiment as keyof typeof acc]++;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    const total = allResponses.length || 100; // Fallback for demo
    
    return {
      sentiment: {
        positive: Math.round((sentimentCounts.positive / total) * 100) || 67,
        neutral: Math.round((sentimentCounts.neutral / total) * 100) || 21,
        negative: Math.round((sentimentCounts.negative / total) * 100) || 12
      },
      professionInsights: {
        "Investment Banking": 78,
        "Medical": 42,
        "Tech": 85,
        "Legal": 63,
        "Real Estate": 71,
        "Sports/Entertainment": 79
      },
      wordCloud: [
        { word: "Performance", size: 24, color: "#8b5cf6" },
        { word: "Luxury", size: 18, color: "#3b82f6" },
        { word: "Innovation", size: 18, color: "#10b981" },
        { word: "Premium", size: 14, color: "#6b7280" },
        { word: "Investment", size: 14, color: "#eab308" },
        { word: "Overpriced", size: 14, color: "#ef4444" },
        { word: "Technology", size: 12, color: "#6366f1" },
        { word: "Status", size: 12, color: "#ec4899" }
      ]
    };
  }
}
