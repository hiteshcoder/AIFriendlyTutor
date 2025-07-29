import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, PieChart, Filter, Download, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface InsightData {
  sentimentTrends: {
    labels: string[];
    positive: number[];
    neutral: number[];
    negative: number[];
  };
  keyPoints: {
    point: string;
    frequency: number;
    sentiment: string;
    categories: string[];
  }[];
  demographics: {
    geography: Record<string, { positive: number; neutral: number; negative: number }>;
    gender: Record<string, { positive: number; neutral: number; negative: number }>;
    hniType: Record<string, { positive: number; neutral: number; negative: number }>;
    wealthTier: Record<string, { positive: number; neutral: number; negative: number }>;
  };
  topConcerns: { concern: string; frequency: number; sentiment: string }[];
  topLikes: { like: string; frequency: number; sentiment: string }[];
}

interface HniAgent {
  id: number;
  name: string;
  hniType: string;
  gender: string;
  location: string;
  wealthTier: string;
  isActive: boolean;
}

export default function Insights() {
  const [geographyFilter, setGeographyFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [wealthTierFilter, setWealthTierFilter] = useState<string>('all');
  const [hniTypeFilter, setHniTypeFilter] = useState<string>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('30d');

  // Build filter params
  const filterParams = new URLSearchParams();
  if (geographyFilter !== 'all') filterParams.set('geography', geographyFilter);
  if (genderFilter !== 'all') filterParams.set('gender', genderFilter);
  if (wealthTierFilter !== 'all') filterParams.set('wealthTier', wealthTierFilter);
  if (hniTypeFilter !== 'all') filterParams.set('hniType', hniTypeFilter);
  if (timeRangeFilter !== 'all') filterParams.set('timeRange', timeRangeFilter);

  // Fetch insights data with filters
  const { data: insights, isLoading } = useQuery<InsightData>({
    queryKey: ['/api/insights', filterParams.toString()],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch agents for filter options
  const { data: agents = [] } = useQuery<HniAgent[]>({
    queryKey: ['/api/agents'],
    staleTime: 5 * 60 * 1000,
  });

  // Extract unique filter options
  const geographyOptions = [...new Set(agents.map(a => a.location))];
  const hniTypeOptions = [...new Set(agents.map(a => a.hniType))];

  // Chart configurations
  const sentimentTrendConfig = insights ? {
    labels: insights.sentimentTrends.labels,
    datasets: [
      {
        label: 'Positive',
        data: insights.sentimentTrends.positive,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'Neutral',
        data: insights.sentimentTrends.neutral,
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        borderColor: 'rgba(234, 179, 8, 1)',
        borderWidth: 2,
      },
      {
        label: 'Negative',
        data: insights.sentimentTrends.negative,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
    ],
  } : null;

  const geographySentimentConfig = insights ? {
    labels: Object.keys(insights.demographics.geography),
    datasets: [
      {
        label: 'Positive',
        data: Object.values(insights.demographics.geography).map(g => g.positive),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Negative',
        data: Object.values(insights.demographics.geography).map(g => g.negative),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  } : null;

  const genderBreakdownConfig = insights ? {
    labels: Object.keys(insights.demographics.gender),
    datasets: [{
      data: Object.values(insights.demographics.gender).map(g => g.positive + g.neutral + g.negative),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 2,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">HNI Insights Dashboard</h1>
              <p className="text-sm text-white/70">Comprehensive analytics and sentiment trends</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="text-white border-white/30">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Select value={geographyFilter} onValueChange={setGeographyFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Geography" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {geographyOptions.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>

              <Select value={wealthTierFilter} onValueChange={setWealthTierFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Wealth Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="HNWI">HNWI ($1M-$5M)</SelectItem>
                  <SelectItem value="VHNWI">VHNWI ($5M-$30M)</SelectItem>
                  <SelectItem value="UHNWI">Ultra HNWI ($30M+)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={hniTypeFilter} onValueChange={setHniTypeFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="HNI Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {hniTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="sentiment" className="space-y-6">
          <TabsList className="bg-black/20 border-white/10">
            <TabsTrigger value="sentiment" className="data-[state=active]:bg-purple-600">
              Sentiment Trends
            </TabsTrigger>
            <TabsTrigger value="demographics" className="data-[state=active]:bg-purple-600">
              Demographics
            </TabsTrigger>
            <TabsTrigger value="keypoints" className="data-[state=active]:bg-purple-600">
              Key Points
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Sentiment Over Time</CardTitle>
                  <CardDescription className="text-white/70">
                    Tracking sentiment trends across all HNI responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sentimentTrendConfig && (
                    <Bar data={sentimentTrendConfig} options={chartOptions} />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Top Concerns</CardTitle>
                  <CardDescription className="text-white/70">
                    Most frequently mentioned concerns by HNIs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights?.topConcerns.slice(0, 5).map((concern, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white/90 text-sm">{concern.concern}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              concern.sentiment === 'negative' 
                                ? 'border-red-500/30 text-red-400'
                                : 'border-yellow-500/30 text-yellow-400'
                            }`}
                          >
                            {concern.sentiment}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-white font-medium">{concern.frequency}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Top Likes</CardTitle>
                  <CardDescription className="text-white/70">
                    Most appreciated aspects mentioned by HNIs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights?.topLikes.slice(0, 5).map((like, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white/90 text-sm">{like.like}</p>
                        <Badge 
                          variant="outline" 
                          className="text-xs border-green-500/30 text-green-400 mt-1"
                        >
                          positive
                        </Badge>
                      </div>
                      <div className="text-white font-medium">{like.frequency}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Geographic Sentiment</CardTitle>
                  <CardDescription className="text-white/70">
                    Sentiment breakdown by geography
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {geographySentimentConfig && (
                    <Bar data={geographySentimentConfig} options={chartOptions} />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Gender Distribution</CardTitle>
                  <CardDescription className="text-white/70">
                    Response distribution by gender
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {genderBreakdownConfig && (
                    <Pie data={genderBreakdownConfig} options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                          },
                        },
                      },
                    }} />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Wealth Tier Analysis</CardTitle>
                  <CardDescription className="text-white/70">
                    Sentiment patterns across wealth tiers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights && Object.entries(insights.demographics.wealthTier).map(([tier, data]) => {
                    const total = data.positive + data.neutral + data.negative;
                    const positivePercent = total > 0 ? Math.round((data.positive / total) * 100) : 0;
                    
                    return (
                      <div key={tier} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/90">{tier}</span>
                          <span className="text-white text-sm">{positivePercent}% positive</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${positivePercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">HNI Type Preferences</CardTitle>
                  <CardDescription className="text-white/70">
                    Response patterns by HNI archetype
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights && Object.entries(insights.demographics.hniType).map(([type, data]) => {
                    const total = data.positive + data.neutral + data.negative;
                    const positivePercent = total > 0 ? Math.round((data.positive / total) * 100) : 0;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">{type}</span>
                          <span className="text-white text-sm">{positivePercent}% positive</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${positivePercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="keypoints" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Key Points Analysis</CardTitle>
                <CardDescription className="text-white/70">
                  Most frequently mentioned points and their sentiment impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights?.keyPoints.slice(0, 10).map((point, i) => (
                    <div key={i} className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white/90">{point.point}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                point.sentiment === 'positive' 
                                  ? 'border-green-500/30 text-green-400'
                                  : point.sentiment === 'negative'
                                  ? 'border-red-500/30 text-red-400'
                                  : 'border-yellow-500/30 text-yellow-400'
                              }`}
                            >
                              {point.sentiment}
                            </Badge>
                            <span className="text-white/60 text-xs">
                              Mentioned {point.frequency} times
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {point.categories.map((category, j) => (
                              <Badge key={j} variant="outline" className="text-xs text-white/60 border-white/20">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{point.frequency}</div>
                          <div className="text-white/60 text-xs">mentions</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}