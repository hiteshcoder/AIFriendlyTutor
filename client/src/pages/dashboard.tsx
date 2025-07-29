import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, BarChart3, Users, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HniAgent {
  id: number;
  name: string;
  archetypeFigure: string;
  hniType: string;
  profession: string;
  gender: string;
  location: string;
  bio: string;
  imageUrl: string;
  personalityTraits: string[];
  preferences: Record<string, any>;
  isActive: boolean;
}

interface BrandQuery {
  id: number;
  content: string;
  timestamp: string;
  accountId: number;
  researcherId: number;
}

interface AgentResponse {
  id: number;
  content: string;
  sentiment: string;
  likes: string[];
  dislikes: string[];
  concerns: string[];
  contextUsed: {
    newsHeadlines: string[];
    personalityTraits: string[];
    preferences: Record<string, any>;
  };
  responseTime: number;
  agent?: HniAgent;
}

interface Analytics {
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  totalQueries: number;
  avgResponseTime: string;
  activeAgents: number;
  hniTypeBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  genderBreakdown: Record<string, number>;
}

export default function Dashboard() {
  const [selectedQuery, setSelectedQuery] = useState<BrandQuery | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHniType, setSelectedHniType] = useState<string>('all');
  const [showAgentContext, setShowAgentContext] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch agents
  const { data: agents = [] } = useQuery<HniAgent[]>({
    queryKey: ['/api/agents'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch queries with search
  const { data: queries = [] } = useQuery<BrandQuery[]>({
    queryKey: ['/api/queries', searchTerm],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch responses for selected query
  const { data: responses = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/queries', selectedQuery?.id, 'responses'],
    enabled: !!selectedQuery,
    staleTime: 30 * 1000,
  });

  // Fetch analytics
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Submit new query mutation
  const submitQueryMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to submit query');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/queries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      setSelectedQuery(data.query);
      setQueryInput('');
    },
  });

  // Filter responses by HNI type
  const filteredResponses = selectedHniType === 'all' 
    ? responses 
    : responses.filter(r => r.agent?.hniType === selectedHniType);

  const handleSubmitQuery = () => {
    if (queryInput.trim()) {
      submitQueryMutation.mutate(queryInput.trim());
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Research Dashboard</h1>
              <p className="text-sm text-white/70">Submit questions to your HNI panel</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-white border-white/30">
                Demo Research Account
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Ask HNI */}
          <div className="lg:col-span-1 space-y-6">
            {/* Query Input */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Ask an HNI
                </CardTitle>
                <CardDescription className="text-white/70">
                  Submit a brand question to our panel of HNI agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., What do you think about Tesla's new luxury model targeting high-net-worth individuals?"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  rows={3}
                />
                <Button 
                  onClick={handleSubmitQuery}
                  disabled={!queryInput.trim() || submitQueryMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {submitQueryMutation.isPending ? 'Analyzing...' : 'Get HNI Insights'}
                </Button>
              </CardContent>
            </Card>

            {/* Search Previous Queries */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Previous Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search previous questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {queries.map((query) => (
                      <div
                        key={query.id}
                        onClick={() => setSelectedQuery(query)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedQuery?.id === query.id
                            ? 'bg-purple-600/20 border border-purple-500/30'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <p className="text-sm text-white/90 truncate">{query.content}</p>
                        <p className="text-xs text-white/50 mt-1">
                          {new Date(query.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Agent Responses */}
          <div className="lg:col-span-1 space-y-6">
            {selectedQuery ? (
              <>
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Current Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/90">{selectedQuery.content}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <Select value={selectedHniType} onValueChange={setSelectedHniType}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All HNI Types</SelectItem>
                          <SelectItem value="Modern Minimalist Professional">Modern Minimalist</SelectItem>
                          <SelectItem value="Heritage Enthusiast">Heritage Enthusiast</SelectItem>
                          <SelectItem value="Sustainable Fashion Advocate">Sustainable Fashion</SelectItem>
                          <SelectItem value="Creative Industry Professional">Creative Industry</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="outline" className="text-white border-white/30">
                        {filteredResponses.length} responses
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredResponses.map((response) => (
                      <Card key={response.id} className="bg-black/20 backdrop-blur-sm border-white/10">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={response.agent?.imageUrl}
                                alt={response.agent?.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <h4 className="text-white font-medium">{response.agent?.name}</h4>
                                <p className="text-white/60 text-sm">{response.agent?.profession}</p>
                                <Badge
                                  variant="outline"
                                  className={`text-xs mt-1 ${
                                    response.sentiment === 'positive'
                                      ? 'border-green-500/30 text-green-400'
                                      : response.sentiment === 'negative'
                                      ? 'border-red-500/30 text-red-400'
                                      : 'border-yellow-500/30 text-yellow-400'
                                  }`}
                                >
                                  {response.sentiment}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAgentContext(
                                showAgentContext === response.agent?.id ? null : response.agent?.id
                              )}
                              className="text-white/60 hover:text-white"
                            >
                              Context
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-white/90 text-sm">{response.content}</p>
                          
                          {/* Likes, Dislikes, Concerns */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {response.likes.length > 0 && (
                              <div>
                                <p className="text-green-400 font-medium mb-1">Likes:</p>
                                <div className="space-y-1">
                                  {response.likes.map((like, i) => (
                                    <Badge key={i} variant="outline" className="text-green-400 border-green-500/30 text-xs">
                                      {like}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {response.dislikes.length > 0 && (
                              <div>
                                <p className="text-red-400 font-medium mb-1">Dislikes:</p>
                                <div className="space-y-1">
                                  {response.dislikes.map((dislike, i) => (
                                    <Badge key={i} variant="outline" className="text-red-400 border-red-500/30 text-xs">
                                      {dislike}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {response.concerns.length > 0 && (
                              <div>
                                <p className="text-yellow-400 font-medium mb-1">Concerns:</p>
                                <div className="space-y-1">
                                  {response.concerns.map((concern, i) => (
                                    <Badge key={i} variant="outline" className="text-yellow-400 border-yellow-500/30 text-xs">
                                      {concern}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Context Panel */}
                          {showAgentContext === response.agent?.id && (
                            <div className="bg-white/5 rounded-lg p-3 mt-3">
                              <h5 className="text-white font-medium mb-2">Context Used</h5>
                              {response.contextUsed.newsHeadlines.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-white/70 text-xs mb-1">Recent News:</p>
                                  {response.contextUsed.newsHeadlines.map((headline, i) => (
                                    <p key={i} className="text-white/60 text-xs">• {headline}</p>
                                  ))}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {response.contextUsed.personalityTraits.map((trait, i) => (
                                  <Badge key={i} variant="outline" className="text-white/60 border-white/20 text-xs">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">Select a question to view HNI agent responses</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Analytics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Queries</p>
                      <p className="text-white text-2xl font-bold">{analytics?.totalQueries || 0}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Active Agents</p>
                      <p className="text-white text-2xl font-bold">{analytics?.activeAgents || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Avg Response</p>
                      <p className="text-white text-2xl font-bold">{analytics?.avgResponseTime || '0s'}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Positive Rate</p>
                      <p className="text-white text-2xl font-bold">
                        {analytics?.sentimentBreakdown ? 
                          (() => {
                            const { positive, neutral, negative } = analytics.sentimentBreakdown;
                            const total = positive + neutral + negative;
                            return total > 0 ? Math.round((positive / total) * 100) : 0;
                          })()
                          : 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Breakdown */}
            {analytics && (
              <>
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400">Positive</span>
                      <span className="text-white">{analytics.sentimentBreakdown.positive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400">Neutral</span>
                      <span className="text-white">{analytics.sentimentBreakdown.neutral}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-400">Negative</span>
                      <span className="text-white">{analytics.sentimentBreakdown.negative}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">HNI Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(analytics.hniTypeBreakdown).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">{type}</span>
                        <span className="text-white">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Geographic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(analytics.locationBreakdown).map(([location, count]) => (
                      <div key={location} className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">{location}</span>
                        <span className="text-white">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}