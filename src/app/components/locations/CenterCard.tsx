import { DonationCenter } from '../../data/donationCenters';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Truck, Building2, Eye, ShieldCheck, Heart } from 'lucide-react';

interface CenterCardProps {
  center: DonationCenter;
  onClick?: () => void;
}

export function CenterCard({ center, onClick }: CenterCardProps) {
  return (
    <div
      onClick={onClick}
      className="group block cursor-pointer h-full"
    >
      <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
        
        {/* Status indicator */}
        <div className="absolute top-3 end-3 z-10 flex gap-2">
          {center.trustedType === 'official' && (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300">
              <ShieldCheck className="h-3 w-3 me-1" /> رسمي
            </Badge>
          )}
          {center.trustedType === 'charity' && (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300">
              <Heart className="h-3 w-3 me-1" /> جمعية
            </Badge>
          )}
          {center.trustedType === 'initiative' && (
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300">
              <Building2 className="h-3 w-3 me-1" /> مبادرة
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col h-full">
          <h3 className="font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors mt-4">
            {center.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {center.description}
          </p>

          <div className="mt-auto space-y-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-1.5">
              {center.category.slice(0, 3).map(cat => (
                <span key={cat} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {cat}
                </span>
              ))}
              {center.category.length > 3 && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{center.category.length - 3}
                </span>
              )}
            </div>

            {/* Footer details */}
            <div className="pt-3 border-t border-border/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{center.cities.join('، ')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {center.pickupAvailable ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Truck className="h-3.5 w-3.5" /> يتوفر استلام منزلي
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> تسليم في المركز
                  </span>
                )}
              </div>
            </div>

            {/* Action */}
            <Button className="w-full mt-2 gap-2" variant="secondary" onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}>
              <Eye className="h-4 w-4" /> عرض التفاصيل
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
