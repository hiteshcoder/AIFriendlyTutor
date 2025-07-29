import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { History, Send, Bot, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'persona';
  content: string;
  persona?: {
    name: string;
    profession: string;
    imageUrl: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    responseTime: number;
  };
  timestamp: Date;
}

export default function ChatInterface() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryPersonasMutation = useMutation({
    mutationFn: async (queryContent: string) => {
      const response = await apiRequest('POST', '/api/query-personas', { content: queryContent });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoading(false);
      
      // Add persona responses to chat
      data.responses.forEach((response: any, index: number) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `response-${Date.now()}-${index}`,
            type: 'persona',
            content: response.content,
            persona: {
              name: response.persona.name,
              profession: response.persona.profession,
              imageUrl: response.persona.imageUrl,
              sentiment: response.sentiment,
              responseTime: response.responseTime
            },
            timestamp: new Date()
          }]);
        }, index * 1000); // Stagger responses for realistic effect
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Query Failed",
        description: "Failed to query personas. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    queryPersonasMutation.mutate(query);
    setQuery("");
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'fa-thumbs-up';
      case 'negative': return 'fa-thumbs-down';
      default: return 'fa-minus';
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text">Brand Query Console</h2>
        <Button variant="outline" className="glass-input border-white/20 hover:bg-white/10">
          <History className="w-4 h-4 mr-2" />
          Query History
        </Button>
      </div>
      
      {/* Query Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="glass-card rounded-xl p-4 border focus-within:border-purple-500 transition-colors">
          <Textarea 
            placeholder="Enter your brand query... e.g., 'How do HNI professionals perceive luxury electric vehicles priced above $150K?'"
            className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none border-0"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <span className="glass-card px-3 py-1 rounded-full text-xs">
              <Bot className="w-3 h-3 mr-1 inline" />AI Powered
            </span>
            <span className="glass-card px-3 py-1 rounded-full text-xs">
              <Shield className="w-3 h-3 mr-1 inline" />Validated
            </span>
          </div>
          <Button 
            type="submit"
            disabled={!query.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Querying...' : 'Query Personas'}
          </Button>
        </div>
      </form>
      
      {/* Chat Messages */}
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {messages.map((message) => (
          <div key={message.id} className={`fade-in ${message.type === 'user' ? 'flex justify-end' : 'flex items-start space-x-3'}`}>
            {message.type === 'user' ? (
              <div className="chat-bubble-user px-6 py-3 rounded-2xl max-w-md text-right">
                <p className="text-white font-medium">{message.content}</p>
                <p className="text-xs text-purple-100 mt-2">Query sent to 50 personas</p>
              </div>
            ) : (
              <>
                <img 
                  src={message.persona?.imageUrl} 
                  alt={message.persona?.name} 
                  className="w-12 h-12 rounded-full border-2 border-purple-300 flex-shrink-0" 
                />
                <div className="chat-bubble-ai px-6 py-4 rounded-2xl max-w-md">
                  <div className="flex items-center mb-2">
                    <h4 className="font-semibold text-white">{message.persona?.name}</h4>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      message.persona?.profession === 'Investment Banker' ? 'bg-blue-500' :
                      message.persona?.profession === 'Medical Professional' ? 'bg-green-500' :
                      message.persona?.profession === 'Tech Entrepreneur' ? 'bg-purple-500' :
                      message.persona?.profession === 'Legal Professional' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}>
                      {message.persona?.profession}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm">{message.content}</p>
                  <div className="flex items-center mt-3 text-xs text-gray-400">
                    <i className={`fas ${getSentimentIcon(message.persona?.sentiment || 'neutral')} ${getSentimentColor(message.persona?.sentiment || 'neutral')} mr-1`}></i>
                    <span className="mr-3 capitalize">{message.persona?.sentiment}</span>
                    <i className="fas fa-clock mr-1"></i>
                    <span>{(message.persona?.responseTime || 2000) / 1000}s response</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="glass-card px-4 py-2 rounded-full flex items-center space-x-2">
              <div className="loading-spinner w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              <span className="text-sm text-gray-300">Loading responses from 50 personas...</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
