import { useState } from 'react';
import { SlidersHorizontal, MapPin, Truck, Building2, Clock, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

export type FiltersState = {
  city: string;
  deliveryMethod: string;
  centerType: string;
  status: string;
};

interface CenterFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
  resultCount: number;
}

export function CenterFilters({ filters, onChange, onReset, resultCount }: CenterFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;

  const handleChange = (key: keyof FiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-[#1A2332]/80 border border-border/50 rounded-2xl shadow-sm p-5 sticky top-[140px]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          الفلاتر
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full ms-2 font-medium">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-rose-500 h-8 px-2 text-xs">
            إعادة ضبط <X className="ms-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* City Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <MapPin className="h-4 w-4 text-slate-400" /> المحافظة
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {['all', 'عمان', 'إربد', 'الزرقاء', 'العقبة', 'الكرك'].map((city) => (
              <FilterChip
                key={city}
                label={city === 'all' ? 'الكل' : city}
                isActive={filters.city === city}
                onClick={() => handleChange('city', city)}
              />
            ))}
          </div>
        </div>

        {/* Delivery Method */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Truck className="h-4 w-4 text-slate-400" /> طريقة التسليم
          </Label>
          <div className="flex flex-col gap-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'self_delivery', label: 'أوصلها بنفسي' },
              { id: 'home_pickup', label: 'استلام من المنزل' },
              { id: 'online', label: 'تبرع أونلاين' },
              { id: 'mobile_campaign', label: 'حملة متنقلة' },
            ].map((method) => (
              <FilterChip
                key={method.id}
                label={method.label}
                isActive={filters.deliveryMethod === method.id}
                onClick={() => handleChange('deliveryMethod', method.id)}
                fullWidth
              />
            ))}
          </div>
        </div>

        {/* Center Type */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Building2 className="h-4 w-4 text-slate-400" /> نوع الجهة
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'hospital', label: 'مستشفى' },
              { id: 'blood_bank', label: 'بنك دم' },
              { id: 'food_bank', label: 'بنك طعام' },
              { id: 'charity', label: 'جمعية' },
              { id: 'takeya', label: 'تكية' },
              { id: 'volunteer_center', label: 'مركز تطوعي' },
            ].map((type) => (
              <FilterChip
                key={type.id}
                label={type.label}
                isActive={filters.centerType === type.id}
                onClick={() => handleChange('centerType', type.id)}
              />
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 text-slate-400" /> الحالة
          </Label>
          <div className="flex flex-col gap-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'open_now', label: 'مفتوح الآن' },
              { id: 'urgent', label: 'حملة عاجلة' },
              { id: 'requires_appointment', label: 'يحتاج حجز' },
            ].map((status) => (
              <FilterChip
                key={status.id}
                label={status.label}
                isActive={filters.status === status.id}
                onClick={() => handleChange('status', status.id)}
                fullWidth
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        تم العثور على <span className="font-bold text-foreground mx-1">{resultCount}</span> مركز
      </div>
    </div>
  );
}

function FilterChip({ label, isActive, onClick, fullWidth = false }: { label: string, isActive: boolean, onClick: () => void, fullWidth?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium py-2 px-3 rounded-lg border transition-all duration-200 text-center ${fullWidth ? 'w-full' : 'w-full'} ${
        isActive
          ? 'bg-primary/10 border-primary text-primary'
          : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {label}
    </button>
  );
}
