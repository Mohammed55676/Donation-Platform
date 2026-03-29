import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
  sortFilter: string;
  onSortChange: (val: string) => void;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortFilter,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border/60 shadow-sm mb-6">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="ابحث في طلبات المجتمع..." 
          className="pl-4 pr-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-1 md:flex-none gap-2">
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[140px] bg-background">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">الكل</SelectItem>
            <SelectItem value="Medical">طبي</SelectItem>
            <SelectItem value="Food">غذاء</SelectItem>
            <SelectItem value="Housing">سكن</SelectItem>
            <SelectItem value="Other">أخرى</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortFilter} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="الترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="urgent">الأكثر إلحاحاً</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
