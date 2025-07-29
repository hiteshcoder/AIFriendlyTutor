import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { Persona } from "@shared/schema";

interface FeaturedPersonasProps {
  personas?: Persona[];
}

export default function FeaturedPersonas({ personas }: FeaturedPersonasProps) {
  // Fallback featured personas with diverse professional headshots
  const defaultPersonas = [
    {
      name: "James Thompson",
      profession: "Investment Banker",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      isActive: true
    },
    {
      name: "Dr. Priya Sharma", 
      profession: "Medical Professional",
      imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      isActive: true
    },
    {
      name: "Carlos Rodriguez",
      profession: "Tech Entrepreneur", 
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      isActive: true
    },
    {
      name: "Jennifer Kim",
      profession: "Legal Professional",
      imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      isActive: false
    }
  ];

  const displayPersonas = personas?.slice(0, 4) || defaultPersonas;

  return (
    <GlassCard>
      <h2 className="text-xl font-bold gradient-text mb-6">Featured Personas</h2>
      
      <div className="space-y-4">
        {displayPersonas.map((persona, index) => (
          <div key={index} className="persona-card glass-card p-4 rounded-xl cursor-pointer">
            <div className="flex items-center space-x-3">
              <img 
                src={persona.imageUrl} 
                alt={persona.name}
                className="w-12 h-12 rounded-full flex-shrink-0" 
              />
              <div>
                <h4 className="font-semibold text-white">{persona.name}</h4>
                <p className="text-xs text-gray-400">{persona.profession}</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${persona.isActive ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                  <span className="text-xs text-gray-300">{persona.isActive ? 'Active' : 'Busy'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline"
        className="w-full mt-4 glass-card py-3 rounded-xl font-medium hover:scale-105 transition-transform text-purple-300 border-white/20 hover:bg-white/10"
      >
        View All 50 Personas
      </Button>
    </GlassCard>
  );
}
