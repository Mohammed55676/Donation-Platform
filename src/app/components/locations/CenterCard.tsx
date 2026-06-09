import { DonationCenter } from '../../data/donationCenters';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Phone, MessageCircle, Navigation, Truck, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CenterCardProps {
  center: DonationCenter;
  onClick?: () => void;
  isSelected?: boolean;
}

const typeLabels: Record<string, string> = {
  blood: 'دم',
  food: 'طعام',
  furniture: 'أثاث',
  clothes: 'ملابس',
  medicine: 'أدوية',
  money: 'مال',
  volunteer: 'تطوع',
};

export function CenterCard({ center, onClick, isSelected }: CenterCardProps) {
  const navigate = useNavigate();

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
    <Card 
      onClick={onClick}
      className={`border transition-all duration-300 cursor-pointer overflow-hidden group ${
        isSelected 
          ? 'border-primary ring-1 ring-primary/20 shadow-md bg-white dark:bg-[#1A2332]' 
          : 'border-border/50 hover:border-primary/50 shadow-sm bg-white dark:bg-[#1A2332]/60 hover:shadow-md'
      }`}
    >
      <div className={`h-1.5 w-full ${isSelected ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-primary/50 transition-colors'}`} />
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{center.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {center.address}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
            {center.isOpen ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 border-none px-2 py-0.5 text-[10px]">
                مفتوح الآن
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-none px-2 py-0.5 text-[10px]">
                مغلق
              </Badge>
            )}
            
            {center.isUrgent && (
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-400 border-none px-2 py-0.5 text-[10px]">
                <AlertCircle className="me-1 h-3 w-3 inline" /> عاجل
              </Badge>
            )}

            {center.distanceKm !== undefined && (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md mt-1">
                يبعد {center.distanceKm.toFixed(1)} كم
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {center.openingHours}
          </div>
          {center.deliveryMethods.includes('home_pickup') && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <Truck className="h-3.5 w-3.5" />
              استلام من المنزل
            </div>
          )}
        </div>

        <div className="mb-5">
          <p className="text-xs text-muted-foreground mb-2 font-medium">يقبل تبرعات:</p>
          <div className="flex flex-wrap gap-1.5">
            {center.acceptedTypes.map(type => (
              <span key={type} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                {typeLabels[type] || type}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleDirections} className="h-9 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Navigation className="me-1.5 h-3.5 w-3.5" /> الاتجاهات
          </Button>
          
          {center.deliveryMethods.includes('home_pickup') ? (
            <Button size="sm" onClick={handlePickup} className="h-9 bg-primary hover:bg-primary/90 text-white shadow-sm">
              <Truck className="me-1.5 h-3.5 w-3.5" /> احجز استلام
            </Button>
          ) : (
            center.whatsapp ? (
              <Button variant="outline" size="sm" onClick={handleWhatsApp} className="h-9 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
                <MessageCircle className="me-1.5 h-3.5 w-3.5" /> واتساب
              </Button>
            ) : center.phone ? (
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${center.phone}`; }} className="h-9 border-slate-200 dark:border-slate-700">
                <Phone className="me-1.5 h-3.5 w-3.5" /> اتصال
              </Button>
            ) : (
              <Button disabled variant="outline" size="sm" className="h-9 opacity-50">
                غير متوفر
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
