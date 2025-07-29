import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "./glass-card";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

export default function AnalyticsDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Default analytics data
  const defaultAnalytics = {
    sentiment: { positive: 67, neutral: 21, negative: 12 },
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
      { word: "Status", size: 12, color: "#ec4899" },
      { word: "Electric", size: 10, color: "#9ca3af" },
      { word: "Reliability", size: 10, color: "#f97316" },
      { word: "Brand", size: 10, color: "#14b8a6" },
      { word: "Competition", size: 8, color: "#a78bfa" },
      { word: "Future", size: 8, color: "#34d399" },
      { word: "Value", size: 8, color: "#60a5fa" }
    ]
  };

  const sentimentData = (analytics as any)?.sentiment || defaultAnalytics.sentiment;
  const professionData = (analytics as any)?.professionInsights || defaultAnalytics.professionInsights;
  const wordCloudData = (analytics as any)?.wordCloud || defaultAnalytics.wordCloud;

  const sentimentChartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(156, 163, 175, 0.8)', 
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const radarChartData = {
    labels: Object.keys(professionData),
    datasets: [{
      label: 'Positive Sentiment %',
      data: Object.values(professionData),
      borderColor: 'rgba(99, 102, 241, 1)',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          padding: 20,
          font: {
            size: 12,
            family: 'Inter'
          }
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: {
            family: 'Inter'
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: '#fff',
          font: {
            size: 11,
            family: 'Inter'
          }
        },
        ticks: {
          display: false
        },
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <>
      {/* Real-time Analytics */}
      <GlassCard>
        <h2 className="text-2xl font-bold gradient-text mb-6">Real-time Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sentiment Distribution */}
          <GlassCard className="p-4">
            <h3 className="font-semibold mb-4 text-white">Sentiment Distribution</h3>
            <div className="h-48">
              <Doughnut data={sentimentChartData} options={chartOptions} />
            </div>
          </GlassCard>
          
          {/* Success Probability */}
          <GlassCard className="p-4">
            <h3 className="font-semibold mb-4 text-white">Success Probability</h3>
            <div className="space-y-3">
              {Object.entries(professionData).map(([profession, percentage]: [string, any]) => (
                <div key={profession}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{profession}</span>
                    <span className={`${
                      percentage > 70 ? 'text-green-400' : 
                      percentage > 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        percentage > 70 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                        percentage > 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </GlassCard>

      {/* Bottom Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Word Cloud Section */}
        <GlassCard>
          <h2 className="text-2xl font-bold gradient-text mb-6">Key Themes</h2>
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-center">
            {/* Luxury car product mockup */}
            <div className="mb-6 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200" 
                alt="Luxury electric sports car" 
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-3">
                {wordCloudData.slice(0, 3).map((item: any, index: number) => (
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-full font-bold"
                    style={{ 
                      backgroundColor: item.color,
                      fontSize: `${item.size}px`
                    }}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                {wordCloudData.slice(3, 8).map((item: any, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                {wordCloudData.slice(8).map((item: any, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 rounded-full text-xs"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
        
        {/* Demographic Insights */}
        <GlassCard>
          <h2 className="text-2xl font-bold gradient-text mb-6">Demographic Insights</h2>
          <div className="h-64 mb-6">
            <Radar data={radarChartData} options={radarOptions} />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 glass-card rounded-lg">
              <span className="text-gray-300">Most Positive</span>
              <span className="text-green-400 font-semibold">Tech Entrepreneurs (85%)</span>
            </div>
            
            <div className="flex justify-between items-center p-3 glass-card rounded-lg">
              <span className="text-gray-300">Most Critical</span>
              <span className="text-red-400 font-semibold">Medical Professionals (42%)</span>
            </div>
            
            <div className="flex justify-between items-center p-3 glass-card rounded-lg">
              <span className="text-gray-300">Overall Sentiment</span>
              <span className="text-blue-400 font-semibold">{sentimentData.positive}% Positive</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
