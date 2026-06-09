import React from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
  sortFilter: string;
  onSortChange: (val: string) => void;
};

// Categories MUST match the Arabic enum values in CommunityRequest.model.js
const CATEGORIES = [
  { value: "الكل", label: "الكل" },
  { value: "طبي", label: "طبي" },
  { value: "غذاء", label: "غذاء" },
  { value: "طعام", label: "طعام" },
  { value: "ملابس", label: "ملابس" },
  { value: "أثاث", label: "أثاث" },
  { value: "أخرى", label: "أخرى" },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortFilter,
  onSortChange,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "الكل" ||
    sortFilter !== "newest";

  const handleClear = () => {
    onSearchChange("");
    onCategoryChange("الكل");
    onSortChange("newest");
  };

  return (
    <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث في طلبات المجتمع..."
          className="ps-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
          <Filter className="h-4 w-4" />
          <span>تصفية:</span>
        </div>

        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[130px] bg-background h-9 text-sm">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortFilter} onValueChange={onSortChange}>
          <SelectTrigger className="w-[130px] bg-background h-9 text-sm">
            <SelectValue placeholder="الترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="urgent">الأكثر إلحاحاً</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-9 gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
};
