import { DonationCenter, DonationType } from '../../data/donationCenters';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  MapPin, Phone, MessageCircle, Navigation, Truck, Clock, AlertCircle,
  Droplet, Utensils, Armchair, Shirt, Pill, HeartHandshake, Users, Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router';

interface CenterCardProps {
  center: DonationCenter;
  onClick?: () => void;
}

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  blood:     { label: 'دم',    icon: Droplet,       color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-100 dark:bg-rose-900/30' },
  food:      { label: 'طعام',  icon: Utensils,      color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-900/30' },
  furniture: { label: 'أثاث',  icon: Armchair,      color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  clothes:   { label: 'ملابس', icon: Shirt,         color: 'text-sky-600 dark:text-sky-400',       bg: 'bg-sky-100 dark:bg-sky-900/30' },
  medicine:  { label: 'أدوية', icon: Pill,          color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30' },
  money:     { label: 'مال',   icon: HeartHandshake,color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  volunteer: { label: 'تطوع',  icon: Users,         color: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

const centerTypeLabels: Record<string, string> = {
  hospital: 'مستشفى',
  blood_bank: 'بنك دم',
  food_bank: 'بنك طعام',
  charity: 'جمعية',
  takeya: 'تكية',
  volunteer_center: 'مركز تطوعي',
};

export function CenterCard({ center, onClick }: CenterCardProps) {
  const navigate = useNavigate();
  const primaryType = center.acceptedTypes[0] || 'blood';
  const cfg = typeConfig[primaryType] || typeConfig.blood;
  const Icon = cfg.icon;

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`, '_blank');
  };

  const handlePickup = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/add-donation?centerId=${center.id}&type=${center.acceptedTypes[0] || 'all'}`);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (center.whatsapp) {
      window.open(`https://wa.me/${center.whatsapp}`, '_blank');
    }
  };

  return (
    <div
      onClick={onClick}
      className="group block cursor-pointer"
    >
      <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">

        {/* Image / Icon area — matches donation card image area */}
        <div className="relative h-48 overflow-hidden bg-muted flex-shrink-0">
          <div className={`w-full h-full flex flex-col items-center justify-center gap-3 ${cfg.bg}`}>
            <Icon className={`h-14 w-14 ${cfg.color} opacity-40`} />
            <span className={`text-sm font-semibold ${cfg.color} opacity-60`}>
              {centerTypeLabels[center.centerType] || center.centerType}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

          {/* Status badge */}
          <div className="absolute top-3 start-3">
            {center.isOpen ? (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                مفتوح الآن
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                مغلق
              </span>
            )}
          </div>

          {/* Urgent badge */}
          {center.isUrgent && (
            <div className="absolute top-3 end-3">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-500 text-white flex items-center gap-1 animate-pulse">
                <AlertCircle className="h-3 w-3" /> عاجل
              </span>
            </div>
          )}

          {/* Distance badge */}
          {center.distanceKm !== undefined && (
            <div className="absolute bottom-3 end-3">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary text-white shadow-md">
                {center.distanceKm.toFixed(1)} كم
              </span>
            </div>
          )}
        </div>

        {/* Body — matches donation card body */}
        <div className="flex flex-col flex-1 p-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {center.acceptedTypes.slice(0, 3).map(type => {
              const tc = typeConfig[type];
              if (!tc) return null;
              return (
                <span key={type} className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                  {tc.label}
                </span>
              );
            })}
            {center.acceptedTypes.length > 3 && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{center.acceptedTypes.length - 3}
              </span>
            )}
          </div>

          {/* Title + description */}
          <h3 className="font-bold text-sm leading-snug mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {center.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {center.description}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-border/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="truncate">{center.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{center.openingHours}</span>
              {center.deliveryMethods.includes('home_pickup') && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium ms-auto">
                  <Truck className="h-3 w-3" /> استلام منزلي
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={handleDirections} className="flex-1 h-8 text-xs rounded-lg border-border/60">
                <Navigation className="me-1 h-3 w-3" /> الاتجاهات
              </Button>
              {center.deliveryMethods.includes('home_pickup') ? (
                <Button size="sm" onClick={handlePickup} className="flex-1 h-8 text-xs rounded-lg bg-primary hover:bg-primary/90 text-white">
                  <Truck className="me-1 h-3 w-3" /> احجز استلام
                </Button>
              ) : center.whatsapp ? (
                <Button variant="outline" size="sm" onClick={handleWhatsApp} className="flex-1 h-8 text-xs rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400">
                  <MessageCircle className="me-1 h-3 w-3" /> واتساب
                </Button>
              ) : center.phone ? (
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${center.phone}`; }} className="flex-1 h-8 text-xs rounded-lg border-border/60">
                  <Phone className="me-1 h-3 w-3" /> اتصال
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
