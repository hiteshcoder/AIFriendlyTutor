import { useState } from "react";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PROFESSIONS, GENDERS, ETHNICITIES } from "@/lib/personas";

interface FilterState {
  professions: string[];
  genders: string[];
  ethnicities: string[];
}

interface PersonaFiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
}

export default function PersonaFilters({ onFiltersChange }: PersonaFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    professions: [...PROFESSIONS],
    genders: [...GENDERS],
    ethnicities: [...ETHNICITIES]
  });

  const handleFilterChange = (category: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        [category]: checked 
          ? [...prev[category], value]
          : prev[category].filter(item => item !== value)
      };
      onFiltersChange?.(updated);
      return updated;
    });
  };

  const applyFilters = () => {
    onFiltersChange?.(filters);
  };

  // Mock counts for each category
  const professionCounts: Record<string, number> = {
    "Investment Banker": 12,
    "Medical Professional": 8,
    "Tech Entrepreneur": 10,
    "Legal Professional": 7,
    "Real Estate Mogul": 6,
    "Sports & Entertainment": 7
  };

  const genderCounts: Record<string, number> = {
    "Male": 26,
    "Female": 21,
    "Non-binary": 3
  };

  const ethnicityCounts: Record<string, number> = {
    "White": 18,
    "Asian": 12,
    "Black": 8,
    "Hispanic/Latino": 7,
    "Mixed/Other": 5
  };

  return (
    <GlassCard>
      <h2 className="text-xl font-bold gradient-text mb-6">Persona Filters</h2>
      
      {/* Profession Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Profession</label>
        <div className="space-y-2">
          {PROFESSIONS.map((profession) => (
            <div key={profession} className="flex items-center space-x-2">
              <Checkbox
                id={`profession-${profession}`}
                checked={filters.professions.includes(profession)}
                onCheckedChange={(checked) => 
                  handleFilterChange('professions', profession, checked as boolean)
                }
                className="border-white/20 data-[state=checked]:bg-purple-500"
              />
              <label 
                htmlFor={`profession-${profession}`}
                className="text-sm text-gray-200 cursor-pointer"
              >
                {profession} ({professionCounts[profession] || 0})
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Gender Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Gender</label>
        <div className="space-y-2">
          {GENDERS.map((gender) => (
            <div key={gender} className="flex items-center space-x-2">
              <Checkbox
                id={`gender-${gender}`}
                checked={filters.genders.includes(gender)}
                onCheckedChange={(checked) => 
                  handleFilterChange('genders', gender, checked as boolean)
                }
                className="border-white/20 data-[state=checked]:bg-purple-500"
              />
              <label 
                htmlFor={`gender-${gender}`}
                className="text-sm text-gray-200 cursor-pointer"
              >
                {gender} ({genderCounts[gender] || 0})
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ethnicity Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Ethnicity</label>
        <div className="space-y-2">
          {ETHNICITIES.map((ethnicity) => (
            <div key={ethnicity} className="flex items-center space-x-2">
              <Checkbox
                id={`ethnicity-${ethnicity}`}
                checked={filters.ethnicities.includes(ethnicity)}
                onCheckedChange={(checked) => 
                  handleFilterChange('ethnicities', ethnicity, checked as boolean)
                }
                className="border-white/20 data-[state=checked]:bg-purple-500"
              />
              <label 
                htmlFor={`ethnicity-${ethnicity}`}
                className="text-sm text-gray-200 cursor-pointer"
              >
                {ethnicity} ({ethnicityCounts[ethnicity] || 0})
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <Button 
        onClick={applyFilters}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-3 rounded-xl font-semibold"
      >
        Apply Filters
      </Button>
    </GlassCard>
  );
}
