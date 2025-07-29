import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Research accounts for multi-tenant support
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Market researchers who use the platform
export const researchers = pgTable("researchers", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
});

// HNI AI agents modeled on real-world figures
export const hniAgents = pgTable("hni_agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  archetypeFigure: text("archetype_figure").notNull(), // Real-world figure they're based on
  hniType: text("hni_type").notNull(), // Modern Minimalist, Heritage Enthusiast, etc.
  profession: text("profession").notNull(),
  gender: text("gender").notNull(),
  location: text("location").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url").notNull(),
  personalityTraits: text("personality_traits").array().notNull(),
  preferences: jsonb("preferences").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Latest news context for each agent (last 10 news items)
export const newsContext = pgTable("news_context", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => hniAgents.id).notNull(),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  url: text("url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Brand queries submitted by researchers
export const brandQueries = pgTable("brand_queries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  researcherId: integer("researcher_id").references(() => researchers.id).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Agent responses to brand queries
export const agentResponses = pgTable("agent_responses", {
  id: serial("id").primaryKey(),
  queryId: integer("query_id").references(() => brandQueries.id).notNull(),
  agentId: integer("agent_id").references(() => hniAgents.id).notNull(),
  content: text("content").notNull(),
  sentiment: text("sentiment").notNull(),
  likes: text("likes").array(),
  dislikes: text("dislikes").array(),
  concerns: text("concerns").array(),
  contextUsed: jsonb("context_used").notNull(), // News context used in response
  responseTime: integer("response_time").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Relations
export const accountsRelations = {
  researchers: () => researchers,
  brandQueries: () => brandQueries,
};

export const researchersRelations = {
  account: () => accounts,
  brandQueries: () => brandQueries,
};

export const hniAgentsRelations = {
  newsContext: () => newsContext,
  agentResponses: () => agentResponses,
};

export const newsContextRelations = {
  agent: () => hniAgents,
};

export const brandQueriesRelations = {
  account: () => accounts,
  researcher: () => researchers,
  agentResponses: () => agentResponses,
};

export const agentResponsesRelations = {
  query: () => brandQueries,
  agent: () => hniAgents,
};

// Insert schemas
export const insertAccountSchema = createInsertSchema(accounts);
export const insertResearcherSchema = createInsertSchema(researchers);
export const insertHniAgentSchema = createInsertSchema(hniAgents);
export const insertNewsContextSchema = createInsertSchema(newsContext);
export const insertBrandQuerySchema = createInsertSchema(brandQueries);
export const insertAgentResponseSchema = createInsertSchema(agentResponses);

// Select schemas
export const selectAccountSchema = createSelectSchema(accounts);
export const selectResearcherSchema = createSelectSchema(researchers);
export const selectHniAgentSchema = createSelectSchema(hniAgents);
export const selectNewsContextSchema = createSelectSchema(newsContext);
export const selectBrandQuerySchema = createSelectSchema(brandQueries);
export const selectAgentResponseSchema = createSelectSchema(agentResponses);

// Types
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Researcher = typeof researchers.$inferSelect;
export type InsertResearcher = z.infer<typeof insertResearcherSchema>;

export type HniAgent = typeof hniAgents.$inferSelect;
export type InsertHniAgent = z.infer<typeof insertHniAgentSchema>;

export type NewsContext = typeof newsContext.$inferSelect;
export type InsertNewsContext = z.infer<typeof insertNewsContextSchema>;

export type BrandQuery = typeof brandQueries.$inferSelect;
export type InsertBrandQuery = z.infer<typeof insertBrandQuerySchema>;

export type AgentResponse = typeof agentResponses.$inferSelect;
export type InsertAgentResponse = z.infer<typeof insertAgentResponseSchema>;