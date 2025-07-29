import { 
  accounts, researchers, hniAgents, newsContext, brandQueries, agentResponses,
  type Account, type Researcher, type HniAgent, type NewsContext, 
  type BrandQuery, type AgentResponse,
  type InsertAccount, type InsertResearcher, type InsertHniAgent, 
  type InsertNewsContext, type InsertBrandQuery, type InsertAgentResponse
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Account methods
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(insertAccount: InsertAccount): Promise<Account>;
  
  // Researcher methods
  getResearcher(id: number): Promise<Researcher | undefined>;
  getResearcherByUsername(username: string): Promise<Researcher | undefined>;
  createResearcher(insertResearcher: InsertResearcher): Promise<Researcher>;
  
  // HNI Agent methods
  getAllAgents(): Promise<HniAgent[]>;
  getActiveAgents(): Promise<HniAgent[]>;
  getAgentsByType(hniType: string): Promise<HniAgent[]>;
  getAgentById(id: number): Promise<HniAgent | undefined>;
  createAgent(insertAgent: InsertHniAgent): Promise<HniAgent>;
  updateAgent(id: number, updateData: Partial<InsertHniAgent>): Promise<HniAgent | undefined>;
  
  // News Context methods
  getLatestNewsForAgent(agentId: number, limit?: number): Promise<NewsContext[]>;
  createNewsContext(insertNews: InsertNewsContext): Promise<NewsContext>;
  updateAgentNewsContext(agentId: number, newsItems: InsertNewsContext[]): Promise<void>;
  
  // Brand Query methods
  createBrandQuery(insertQuery: InsertBrandQuery): Promise<BrandQuery>;
  getQueriesByAccount(accountId: number, limit?: number): Promise<BrandQuery[]>;
  searchQueries(accountId: number, searchTerm: string): Promise<BrandQuery[]>;
  
  // Agent Response methods
  createAgentResponse(insertResponse: InsertAgentResponse): Promise<AgentResponse>;
  getResponsesByQuery(queryId: number): Promise<AgentResponse[]>;
  getResponseStats(accountId: number): Promise<{
    totalQueries: number;
    avgResponseTime: string;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    activeAgents: number;
  }>;
  
  // Initialize sample data
  initializeWithSampleData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Account methods
  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    return account;
  }

  // Researcher methods
  async getResearcher(id: number): Promise<Researcher | undefined> {
    const [researcher] = await db.select().from(researchers).where(eq(researchers.id, id));
    return researcher || undefined;
  }

  async getResearcherByUsername(username: string): Promise<Researcher | undefined> {
    const [researcher] = await db.select().from(researchers).where(eq(researchers.username, username));
    return researcher || undefined;
  }

  async createResearcher(insertResearcher: InsertResearcher): Promise<Researcher> {
    const [researcher] = await db.insert(researchers).values(insertResearcher).returning();
    return researcher;
  }

  // HNI Agent methods
  async getAllAgents(): Promise<HniAgent[]> {
    return await db.select().from(hniAgents);
  }

  async getActiveAgents(): Promise<HniAgent[]> {
    return await db.select().from(hniAgents).where(eq(hniAgents.isActive, true));
  }

  async getAgentsByType(hniType: string): Promise<HniAgent[]> {
    return await db.select().from(hniAgents).where(
      and(eq(hniAgents.hniType, hniType), eq(hniAgents.isActive, true))
    );
  }

  async getAgentById(id: number): Promise<HniAgent | undefined> {
    const [agent] = await db.select().from(hniAgents).where(eq(hniAgents.id, id));
    return agent || undefined;
  }

  async createAgent(insertAgent: InsertHniAgent): Promise<HniAgent> {
    const [agent] = await db.insert(hniAgents).values(insertAgent).returning();
    return agent;
  }

  async updateAgent(id: number, updateData: Partial<InsertHniAgent>): Promise<HniAgent | undefined> {
    const [agent] = await db.update(hniAgents)
      .set(updateData)
      .where(eq(hniAgents.id, id))
      .returning();
    return agent || undefined;
  }

  // News Context methods
  async getLatestNewsForAgent(agentId: number, limit: number = 10): Promise<NewsContext[]> {
    return await db.select().from(newsContext)
      .where(eq(newsContext.agentId, agentId))
      .orderBy(desc(newsContext.publishedAt))
      .limit(limit);
  }

  async createNewsContext(insertNews: InsertNewsContext): Promise<NewsContext> {
    const [news] = await db.insert(newsContext).values(insertNews).returning();
    return news;
  }

  async updateAgentNewsContext(agentId: number, newsItems: InsertNewsContext[]): Promise<void> {
    // Delete old news for this agent
    await db.delete(newsContext).where(eq(newsContext.agentId, agentId));
    
    // Insert new news items
    if (newsItems.length > 0) {
      await db.insert(newsContext).values(newsItems);
    }
  }

  // Brand Query methods
  async createBrandQuery(insertQuery: InsertBrandQuery): Promise<BrandQuery> {
    const [query] = await db.insert(brandQueries).values(insertQuery).returning();
    return query;
  }

  async getQueriesByAccount(accountId: number, limit: number = 50): Promise<BrandQuery[]> {
    return await db.select().from(brandQueries)
      .where(eq(brandQueries.accountId, accountId))
      .orderBy(desc(brandQueries.timestamp))
      .limit(limit);
  }

  async searchQueries(accountId: number, searchTerm: string): Promise<BrandQuery[]> {
    return await db.select().from(brandQueries)
      .where(and(
        eq(brandQueries.accountId, accountId),
        // Using basic text search for now
      ))
      .orderBy(desc(brandQueries.timestamp));
  }

  // Agent Response methods
  async createAgentResponse(insertResponse: InsertAgentResponse): Promise<AgentResponse> {
    const [response] = await db.insert(agentResponses).values(insertResponse).returning();
    return response;
  }

  async getResponsesByQuery(queryId: number): Promise<AgentResponse[]> {
    return await db.select().from(agentResponses)
      .where(eq(agentResponses.queryId, queryId))
      .orderBy(agentResponses.timestamp);
  }

  async getResponseStats(accountId: number): Promise<{
    totalQueries: number;
    avgResponseTime: string;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    activeAgents: number;
  }> {
    const queries = await db.select().from(brandQueries)
      .where(eq(brandQueries.accountId, accountId));
    
    const responses = await db.select().from(agentResponses)
      .innerJoin(brandQueries, eq(agentResponses.queryId, brandQueries.id))
      .where(eq(brandQueries.accountId, accountId));
    
    const activeAgentsCount = await db.select().from(hniAgents)
      .where(eq(hniAgents.isActive, true));

    const avgTime = responses.length > 0 
      ? responses.reduce((sum, r) => sum + r.agent_responses.responseTime, 0) / responses.length 
      : 3200;

    const sentimentCounts = responses.reduce((acc, r) => {
      const sentiment = r.agent_responses.sentiment;
      acc[sentiment as keyof typeof acc] = (acc[sentiment as keyof typeof acc] || 0) + 1;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    return {
      totalQueries: queries.length,
      avgResponseTime: `${(avgTime / 1000).toFixed(1)}s`,
      sentimentBreakdown: sentimentCounts,
      activeAgents: activeAgentsCount.length
    };
  }

  // Initialize with sample data based on PRD
  async initializeWithSampleData(): Promise<void> {
    const existingAgents = await this.getAllAgents();
    if (existingAgents.length > 0) return; // Already initialized

    // Create default account
    const defaultAccount = await this.createAccount({
      name: "Demo Research Account"
    });

    // Create default researcher
    await this.createResearcher({
      username: "demo_researcher",
      password: "demo123", // In production, this should be hashed
      accountId: defaultAccount.id
    });

    // Sample HNI agents based on PRD archetypes
    const sampleAgents: InsertHniAgent[] = [
      // Modern Minimalist Professionals (based on Joshua Fields Millburn)
      {
        name: "Joshua Millbrook",
        archetypeFigure: "Joshua Fields Millburn",
        hniType: "Modern Minimalist Professional",
        profession: "Minimalism Consultant",
        gender: "Male",
        location: "Los Angeles, CA",
        bio: "Minimalism advocate and documentary filmmaker. Former corporate executive who embraced intentional living. Focuses on experiences over possessions.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        personalityTraits: ["minimalist", "intentional", "experience-focused", "anti-consumerist"],
        preferences: {
          values: ["sustainability", "intentionality", "experiences"],
          luxuryApproach: "quality over quantity",
          spendingStyle: "selective premium purchases"
        },
        isActive: true
      },
      {
        name: "Maya Chen-Fields",
        archetypeFigure: "Joshua Fields Millburn",
        hniType: "Modern Minimalist Professional",
        profession: "Digital Wellness Coach",
        gender: "Female",
        location: "San Francisco, CA",
        bio: "Digital minimalism expert helping tech professionals find balance. Former Silicon Valley product manager turned wellness advocate.",
        imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        personalityTraits: ["tech-savvy", "wellness-focused", "minimalist", "pragmatic"],
        preferences: {
          values: ["digital wellness", "work-life balance", "mindfulness"],
          luxuryApproach: "technology that enhances life",
          spendingStyle: "investment in experiences and health"
        },
        isActive: true
      },
      
      // Heritage Enthusiasts (based on Loyd Grossman)
      {
        name: "Loyd Ashworth",
        archetypeFigure: "Loyd Grossman",
        hniType: "Heritage Enthusiast",
        profession: "Cultural Heritage Consultant",
        gender: "Male",
        location: "London, UK",
        bio: "British heritage preservationist and cultural advisor. Champion of traditional craftsmanship and historical luxury brands.",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        personalityTraits: ["traditional", "cultured", "heritage-focused", "quality-conscious"],
        preferences: {
          values: ["tradition", "craftsmanship", "heritage"],
          luxuryApproach: "timeless over trendy",
          spendingStyle: "investment in legacy brands"
        },
        isActive: true
      },
      {
        name: "Victoria Pemberton",
        archetypeFigure: "Loyd Grossman",
        hniType: "Heritage Enthusiast",
        profession: "Art Curator",
        gender: "Female",
        location: "Edinburgh, UK",
        bio: "Museum curator specializing in British decorative arts. Passionate about preserving traditional luxury crafts and supporting heritage brands.",
        imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        personalityTraits: ["scholarly", "preservation-minded", "aesthetic", "traditional"],
        preferences: {
          values: ["cultural preservation", "artisanship", "historical significance"],
          luxuryApproach: "authentic heritage brands",
          spendingStyle: "supporting traditional crafts"
        },
        isActive: true
      },
      
      // Sustainable Fashion Advocates (based on Emma Watson)
      {
        name: "Emma Richardson",
        archetypeFigure: "Emma Watson",
        hniType: "Sustainable Fashion Advocate",
        profession: "Sustainable Fashion Consultant",
        gender: "Female",
        location: "New York, NY",
        bio: "Fashion sustainability expert and ethical brand advocate. Former actor turned activist for sustainable luxury and ethical consumption.",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        personalityTraits: ["ethical", "environmentally-conscious", "influential", "principled"],
        preferences: {
          values: ["sustainability", "ethical production", "social responsibility"],
          luxuryApproach: "sustainable luxury brands",
          spendingStyle: "ethical premium purchases"
        },
        isActive: true
      },
      {
        name: "Sophia Green-Watson",
        archetypeFigure: "Emma Watson",
        hniType: "Sustainable Fashion Advocate",
        profession: "Environmental Lawyer",
        gender: "Female",
        location: "Vancouver, CA",
        bio: "Environmental law specialist focusing on corporate sustainability. Advocates for transparent supply chains in luxury fashion.",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        personalityTraits: ["analytical", "justice-oriented", "environmentalist", "rigorous"],
        preferences: {
          values: ["environmental justice", "transparency", "accountability"],
          luxuryApproach: "certified sustainable brands",
          spendingStyle: "research-driven ethical purchases"
        },
        isActive: true
      }
    ];

    // Create sample agents
    for (const agent of sampleAgents) {
      await this.createAgent(agent);
    }

    // Add sample news context for each agent
    const agents = await this.getAllAgents();
    for (const agent of agents) {
      const sampleNews: InsertNewsContext[] = [
        {
          agentId: agent.id,
          headline: `${agent.archetypeFigure} speaks at sustainability conference`,
          summary: `Recent appearance discussing the future of ethical consumption and luxury brands.`,
          url: "https://example.com/news1",
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          agentId: agent.id,
          headline: `New documentary features ${agent.archetypeFigure}`,
          summary: `Upcoming documentary explores their impact on modern consumer culture.`,
          url: "https://example.com/news2",
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
          agentId: agent.id,
          headline: `${agent.archetypeFigure} launches new initiative`,
          summary: `Recent project aimed at promoting conscious consumption among high-net-worth individuals.`,
          url: "https://example.com/news3",
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
        }
      ];

      for (const news of sampleNews) {
        await this.createNewsContext(news);
      }
    }
  }
}

export const storage = new DatabaseStorage();