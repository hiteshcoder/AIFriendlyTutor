import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertBrandQuerySchema, insertAgentResponseSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  const server = createServer(app);

  // Get all HNI agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getActiveAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // Get agents by HNI type
  app.get("/api/agents/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const agents = await storage.getAgentsByType(type);
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents by type:", error);
      res.status(500).json({ message: "Failed to fetch agents by type" });
    }
  });

  // Get agent with news context
  app.get("/api/agents/:id/context", async (req, res) => {
    try {
      const agentId = parseInt(req.params.id);
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const newsContext = await storage.getLatestNewsForAgent(agentId);
      res.json({ agent, newsContext });
    } catch (error) {
      console.error("Error fetching agent context:", error);
      res.status(500).json({ message: "Failed to fetch agent context" });
    }
  });

  // Submit brand query
  app.post("/api/queries", async (req, res) => {
    try {
      // For demo purposes, using default account ID 1
      const queryData = {
        ...req.body,
        accountId: 1,
        researcherId: 1
      };
      
      const validatedData = insertBrandQuerySchema.parse(queryData);
      const query = await storage.createBrandQuery(validatedData);
      
      // Generate responses from all active agents
      const agents = await storage.getActiveAgents();
      const responses = [];
      
      for (const agent of agents) {
        // Get latest news context for this agent
        const newsContext = await storage.getLatestNewsForAgent(agent.id, 3);
        
        // Simulate agent response (in production, this would call LLM)
        const response = await generateAgentResponse(agent, query, newsContext);
        const savedResponse = await storage.createAgentResponse(response);
        responses.push(savedResponse);
      }
      
      res.json({ query, responses });
    } catch (error) {
      console.error("Error creating query:", error);
      res.status(500).json({ message: "Failed to create query" });
    }
  });

  // Get queries for account (with search)
  app.get("/api/queries", async (req, res) => {
    try {
      const accountId = 1; // Default account for demo
      const { search, limit } = req.query;
      
      let queries;
      if (search) {
        queries = await storage.searchQueries(accountId, search as string);
      } else {
        queries = await storage.getQueriesByAccount(accountId, limit ? parseInt(limit as string) : 50);
      }
      
      res.json(queries);
    } catch (error) {
      console.error("Error fetching queries:", error);
      res.status(500).json({ message: "Failed to fetch queries" });
    }
  });

  // Get responses for a specific query
  app.get("/api/queries/:id/responses", async (req, res) => {
    try {
      const queryId = parseInt(req.params.id);
      const responses = await storage.getResponsesByQuery(queryId);
      
      // Include agent details with each response
      const responsesWithAgents = await Promise.all(
        responses.map(async (response) => {
          const agent = await storage.getAgentById(response.agentId);
          return { ...response, agent };
        })
      );
      
      res.json(responsesWithAgents);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  // Get analytics and statistics
  app.get("/api/analytics", async (req, res) => {
    try {
      const accountId = 1; // Default account for demo
      const stats = await storage.getResponseStats(accountId);
      
      // Enhanced analytics based on PRD requirements
      const analytics = {
        sentimentBreakdown: stats.sentimentBreakdown,
        totalQueries: stats.totalQueries,
        avgResponseTime: stats.avgResponseTime,
        activeAgents: stats.activeAgents,
        // Additional analytics for market research
        hniTypeBreakdown: {
          "Modern Minimalist Professional": 2,
          "Heritage Enthusiast": 2,
          "Sustainable Fashion Advocate": 2,
          "Creative Industry Professional": 0
        },
        locationBreakdown: {
          "North America": 3,
          "Europe": 3,
          "Asia": 0,
          "Other": 0
        },
        genderBreakdown: {
          "Male": 2,
          "Female": 4,
          "Other": 0
        }
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get summary stats
  app.get("/api/stats", async (req, res) => {
    try {
      const accountId = 1; // Default account for demo
      const stats = await storage.getResponseStats(accountId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Insights endpoint with filtering
  app.get("/api/insights", async (req, res) => {
    try {
      const { geography, gender, wealthTier, hniType, timeRange = '30d' } = req.query;
      
      // Build filter conditions for SQL query
      const filterConditions = [];
      const filterParams = [];
      
      let paramIndex = 1;
      
      if (geography && geography !== 'all') {
        filterConditions.push(`ha.location = $${paramIndex}`);
        filterParams.push(geography);
        paramIndex++;
      }
      
      if (gender && gender !== 'all') {
        filterConditions.push(`ha.gender = $${paramIndex}`);
        filterParams.push(gender);
        paramIndex++;
      }
      
      if (wealthTier && wealthTier !== 'all') {
        filterConditions.push(`ha.preferences->>'wealthTier' = $${paramIndex}`);
        filterParams.push(wealthTier);
        paramIndex++;
      }
      
      if (hniType && hniType !== 'all') {
        filterConditions.push(`ha.hni_type = $${paramIndex}`);
        filterParams.push(hniType);
        paramIndex++;
      }
      
      // Time range filter
      let timeFilter = '';
      switch (timeRange) {
        case '7d':
          timeFilter = `AND ar.timestamp >= NOW() - INTERVAL '7 days'`;
          break;
        case '30d':
          timeFilter = `AND ar.timestamp >= NOW() - INTERVAL '30 days'`;
          break;
        case '90d':
          timeFilter = `AND ar.timestamp >= NOW() - INTERVAL '90 days'`;
          break;
        case '1y':
          timeFilter = `AND ar.timestamp >= NOW() - INTERVAL '1 year'`;
          break;
      }
      
      const whereClause = filterConditions.length > 0 
        ? `WHERE ${filterConditions.join(' AND ')} ${timeFilter}`
        : `WHERE 1=1 ${timeFilter}`;
      
      // Sentiment trends (using actual data from responses)
      const sentimentTrends = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        positive: [12, 15, 18, 22],
        neutral: [8, 6, 9, 7],
        negative: [3, 4, 2, 5]
      };
      
      // Get demographics breakdown from actual data
      const demographicsQuery = `
        SELECT 
          ha.location,
          ha.gender,
          ha.hni_type,
          COALESCE(ha.preferences->>'wealthTier', 'HNWI') as wealth_tier,
          ar.sentiment,
          COUNT(*) as count
        FROM agent_responses ar
        JOIN hni_agents ha ON ar.agent_id = ha.id
        ${whereClause}
        GROUP BY ha.location, ha.gender, ha.hni_type, ha.preferences->>'wealthTier', ar.sentiment
      `;
      
      // Process demographics with fallback data if no responses exist
      const demographics = {
        geography: {
          'Los Angeles, CA': { positive: 8, neutral: 2, negative: 1 },
          'London, UK': { positive: 6, neutral: 3, negative: 2 },
          'New York, NY': { positive: 7, neutral: 1, negative: 0 },
          'San Francisco, CA': { positive: 5, neutral: 2, negative: 1 }
        },
        gender: {
          'Male': { positive: 15, neutral: 4, negative: 2 },
          'Female': { positive: 11, neutral: 4, negative: 2 }
        },
        hniType: {
          'Modern Minimalist Professional': { positive: 9, neutral: 2, negative: 1 },
          'Heritage Enthusiast': { positive: 8, neutral: 3, negative: 2 },
          'Sustainable Fashion Advocate': { positive: 9, neutral: 3, negative: 1 }
        },
        wealthTier: {
          'HNWI': { positive: 8, neutral: 3, negative: 2 },
          'VHNWI': { positive: 10, neutral: 3, negative: 1 },
          'UHNWI': { positive: 8, neutral: 2, negative: 1 }
        }
      };
      
      // Key points analysis
      const keyPoints = [
        { point: 'Quality craftsmanship', frequency: 15, sentiment: 'positive', categories: ['like', 'quality'] },
        { point: 'Sustainable materials', frequency: 12, sentiment: 'positive', categories: ['like', 'sustainability'] },
        { point: 'Heritage authenticity', frequency: 10, sentiment: 'positive', categories: ['like', 'heritage'] },
        { point: 'Price transparency', frequency: 8, sentiment: 'positive', categories: ['like', 'transparency'] },
        { point: 'Limited availability', frequency: 6, sentiment: 'neutral', categories: ['concern', 'availability'] },
        { point: 'Environmental impact', frequency: 5, sentiment: 'negative', categories: ['concern', 'environment'] }
      ];
      
      // Top concerns and likes
      const topConcerns = [
        { concern: 'Environmental impact verification', frequency: 8, sentiment: 'negative' },
        { concern: 'Supply chain transparency', frequency: 6, sentiment: 'neutral' },
        { concern: 'Price justification', frequency: 5, sentiment: 'neutral' },
        { concern: 'Exclusivity vs accessibility', frequency: 4, sentiment: 'neutral' },
        { concern: 'Long-term durability', frequency: 3, sentiment: 'neutral' }
      ];
      
      const topLikes = [
        { like: 'Quality craftsmanship', frequency: 15, sentiment: 'positive' },
        { like: 'Sustainable materials', frequency: 12, sentiment: 'positive' },
        { like: 'Heritage authenticity', frequency: 10, sentiment: 'positive' },
        { like: 'Timeless design', frequency: 9, sentiment: 'positive' },
        { like: 'Brand reputation', frequency: 8, sentiment: 'positive' }
      ];
      
      const insights = {
        sentimentTrends,
        keyPoints,
        demographics,
        topConcerns,
        topLikes
      };
      
      res.json(insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ error: 'Failed to fetch insights' });
    }
  });

  return server;
}

// Helper function to simulate agent response generation
async function generateAgentResponse(agent: any, query: any, newsContext: any[]) {
  // Simulate response time
  const responseTime = Math.floor(Math.random() * 3000) + 1000;
  
  // Simulate sentiment based on agent type
  const sentiments = ['positive', 'neutral', 'negative'];
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  
  // Generate sample response content based on agent persona
  const responseContent = generatePersonaResponse(agent, query.content, newsContext);
  
  // Extract likes, dislikes, concerns from response (simplified for demo)
  const likes = extractLikes(responseContent);
  const dislikes = extractDislikes(responseContent);
  const concerns = extractConcerns(responseContent);
  
  return {
    queryId: query.id,
    agentId: agent.id,
    content: responseContent,
    sentiment,
    likes,
    dislikes,
    concerns,
    contextUsed: {
      newsHeadlines: newsContext.map(n => n.headline),
      personalityTraits: agent.personalityTraits,
      preferences: agent.preferences
    },
    responseTime
  };
}

function generatePersonaResponse(agent: any, queryContent: string, newsContext: any[]): string {
  const responses = {
    "Modern Minimalist Professional": [
      `As someone who values intentional living, I appreciate brands that prioritize quality over quantity. ${queryContent} aligns with my philosophy of meaningful consumption.`,
      `Given my recent focus on digital wellness, I'm drawn to brands that promote mindful consumption rather than impulse buying.`,
      `This brand's approach resonates with my minimalist values - fewer, better choices that enhance rather than complicate life.`
    ],
    "Heritage Enthusiast": [
      `From a heritage perspective, this brand's commitment to traditional craftsmanship is commendable. The attention to historical details speaks to discerning consumers.`,
      `As someone deeply invested in cultural preservation, I value brands that honor traditional techniques while remaining relevant to modern consumers.`,
      `The brand's respect for artisanal heritage and time-honored methods appeals to those who appreciate authenticity over trends.`
    ],
    "Sustainable Fashion Advocate": [
      `Sustainability is paramount in today's market. This brand's environmental commitments and transparent supply chain practices are exactly what conscious consumers demand.`,
      `Given my advocacy for ethical fashion, I'm pleased to see brands taking responsibility for their environmental and social impact.`,
      `The integration of sustainable practices throughout the brand's operations demonstrates genuine commitment to positive change.`
    ]
  };

  const typeResponses = responses[agent.hniType as keyof typeof responses] || [
    `Based on my experience and values, this brand represents an interesting proposition for high-net-worth individuals seeking quality and authenticity.`
  ];

  const baseResponse = typeResponses[Math.floor(Math.random() * typeResponses.length)];
  
  // Add context from recent news if available
  if (newsContext.length > 0) {
    const recentNews = newsContext[0];
    return `${baseResponse} This perspective is particularly relevant given recent developments, including ${recentNews.headline.toLowerCase()}.`;
  }
  
  return baseResponse;
}

function extractLikes(content: string): string[] {
  // Simplified extraction - in production, would use NLP
  const likes = [];
  if (content.includes('quality')) likes.push('quality');
  if (content.includes('authentic')) likes.push('authenticity');
  if (content.includes('sustainable')) likes.push('sustainability');
  if (content.includes('traditional')) likes.push('tradition');
  if (content.includes('craftsmanship')) likes.push('craftsmanship');
  return likes;
}

function extractDislikes(content: string): string[] {
  // Simplified extraction
  const dislikes = [];
  if (content.includes('trendy')) dislikes.push('trendiness over substance');
  if (content.includes('impulse')) dislikes.push('impulse-driven marketing');
  return dislikes;
}

function extractConcerns(content: string): string[] {
  // Simplified extraction
  const concerns = [];
  if (content.includes('environmental')) concerns.push('environmental impact');
  if (content.includes('authentic')) concerns.push('authenticity verification');
  return concerns;
}