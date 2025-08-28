import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchAndFilter = ({ 
  searchQuery, 
  onSearchChange, 
  selectedCategories, 
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  onClearFilters 
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Updates', icon: 'Globe', count: 24 },
    { id: 'schedule', label: 'Schedule', icon: 'Calendar', count: 8 },
    { id: 'technical', label: 'Technical', icon: 'Code', count: 6 },
    { id: 'logistics', label: 'Logistics', icon: 'Truck', count: 5 },
    { id: 'general', label: 'General', icon: 'Info', count: 5 }
  ];

  const priorities = [
    { id: 'all', label: 'All Priorities', color: 'text-muted-foreground' },
    { id: 'high', label: 'High Priority', color: 'text-accent' },
    { id: 'medium', label: 'Medium Priority', color: 'text-warning' },
    { id: 'low', label: 'Low Priority', color: 'text-primary' }
  ];

  const hasActiveFilters = selectedCategories?.length > 0 || selectedPriority !== 'all' || searchQuery?.length > 0;

  return (
    <div className="glass rounded-xl border border-border p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Input
          type="search"
          placeholder="Search updates, announcements, or keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="pl-12"
        />
        <Icon 
          name="Search" 
          size={20} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
        />
      </div>
      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-smooth"
        >
          <Icon name="Filter" size={18} />
          <span className="font-inter font-medium">Filters</span>
          <Icon 
            name={isFilterOpen ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-smooth"
          >
            <Icon name="X" size={14} />
            <span className="font-inter text-sm">Clear All</span>
          </button>
        )}
      </div>
      {/* Filter Options */}
      {isFilterOpen && (
        <div className="space-y-6 pt-4 border-t border-border">
          {/* Categories */}
          <div>
            <h3 className="font-orbitron font-bold text-foreground mb-3">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {categories?.map((category) => {
                const isSelected = selectedCategories?.includes(category?.id) || 
                  (category?.id === 'all' && selectedCategories?.length === 0);
                
                return (
                  <button
                    key={category?.id}
                    onClick={() => onCategoryChange(category?.id)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-layout hover:scale-105 ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary neon-border' :'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10'
                    }`}
                  >
                    <Icon name={category?.icon} size={16} />
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-inter font-medium text-sm truncate">
                        {category?.label}
                      </div>
                      <div className="font-jetbrains text-xs opacity-70">
                        {category?.count}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <h3 className="font-orbitron font-bold text-foreground mb-3">Priority Level</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {priorities?.map((priority) => {
                const isSelected = selectedPriority === priority?.id;
                
                return (
                  <button
                    key={priority?.id}
                    onClick={() => onPriorityChange(priority?.id)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-layout hover:scale-105 ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary neon-border' :'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      priority?.id === 'high' ? 'bg-accent' :
                      priority?.id === 'medium' ? 'bg-warning' :
                      priority?.id === 'low'? 'bg-primary' : 'bg-muted-foreground'
                    }`}></div>
                    <span className="font-inter font-medium text-sm">
                      {priority?.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm font-inter">
            <Icon name="Filter" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Active filters:</span>
            
            {searchQuery && (
              <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                Search: "{searchQuery}"
              </span>
            )}
            
            {selectedCategories?.length > 0 && (
              <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                {selectedCategories?.length} categories
              </span>
            )}
            
            {selectedPriority !== 'all' && (
              <span className="px-2 py-1 bg-warning/20 text-warning rounded-full text-xs">
                {priorities?.find(p => p?.id === selectedPriority)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;