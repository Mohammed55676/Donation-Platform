import { Droplet, Utensils, Armchair, Shirt, Pill, HeartHandshake, Users, Grid } from 'lucide-react';
import { Button } from '../ui/button';
import { DonationType } from '../../data/donationCenters';

interface DonationTypeFiltersProps {
  selectedType: DonationType;
  onSelectType: (type: DonationType) => void;
}

const filterOptions: { type: DonationType; label: string; icon: any; colorClass: string; bgClass: string }[] = [
  { type: 'all', label: 'الكل', icon: Grid, colorClass: 'text-slate-700 dark:text-slate-300', bgClass: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700' },
  { type: 'blood', label: 'دم', icon: Droplet, colorClass: 'text-rose-600 dark:text-rose-400', bgClass: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50' },
  { type: 'food', label: 'طعام', icon: Utensils, colorClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50' },
  { type: 'furniture', label: 'أثاث', icon: Armchair, colorClass: 'text-amber-700 dark:text-amber-500', bgClass: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/50' },
  { type: 'clothes', label: 'ملابس', icon: Shirt, colorClass: 'text-sky-600 dark:text-sky-400', bgClass: 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/50' },
  { type: 'medicine', label: 'أدوية', icon: Pill, colorClass: 'text-fuchsia-600 dark:text-fuchsia-400', bgClass: 'bg-fuchsia-50 hover:bg-fuchsia-100 dark:bg-fuchsia-950/50 dark:hover:bg-fuchsia-900/50' },
  { type: 'money', label: 'مال', icon: HeartHandshake, colorClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50' },
  { type: 'volunteer', label: 'تطوع', icon: Users, colorClass: 'text-teal-600 dark:text-teal-400', bgClass: 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/50' },
];

export function DonationTypeFilters({ selectedType, onSelectType }: DonationTypeFiltersProps) {
  return (
    <div className="w-full bg-background border-b border-border/50 sticky top-[64px] md:top-[72px] z-30 shadow-sm py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;
            
            return (
              <Button
                key={option.type}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onSelectType(option.type)}
                className={`snap-center rounded-full flex-shrink-0 h-10 px-4 gap-2 transition-all duration-300 border ${
                  isSelected 
                    ? 'bg-[#1A2332] text-white hover:bg-[#0F1623] border-transparent shadow-md' 
                    : `bg-white dark:bg-[#1A2332]/40 border-border/50 ${option.colorClass} hover:border-${option.colorClass.split('-')[1]}-500/30`
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : option.colorClass}`} />
                <span className="font-semibold text-sm">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
