import { DonationCampaign } from '../../data/donationCenters';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

interface CampaignCardsProps {
  campaigns: DonationCampaign[];
}

export function CampaignCards({ campaigns }: CampaignCardsProps) {
  if (campaigns.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">حملات تبرع مميزة</h2>
          <p className="text-muted-foreground text-sm">حملات نشطة الآن تحتاج دعمك</p>
        </div>
        <Button variant="ghost" className="text-primary hover:bg-primary/10">
          عرض الكل <ArrowLeft className="ms-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {campaigns.map((camp) => (
          <CampaignCard key={camp.id} campaign={camp} />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: DonationCampaign }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-[#1A2332]/60 flex flex-col group">
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
        {!imgError ? (
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <ImageIcon className="h-10 w-10 mb-2" />
            <span className="text-xs font-medium">صورة غير متوفرة</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {campaign.isUrgent && (
          <Badge className="absolute top-3 end-3 bg-rose-500 hover:bg-rose-600 text-white border-none shadow-md px-3 py-1 animate-pulse">
            <AlertCircle className="me-1 h-3.5 w-3.5" /> عاجل
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5 flex-1 flex flex-col">
        <span className="text-xs text-primary font-bold mb-2">{campaign.organization}</span>
        <h3 className="font-bold text-lg leading-tight mb-2 text-foreground group-hover:text-primary transition-colors">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
          {campaign.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-5">
          {campaign.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-[10px] px-2 py-0.5 border-none">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mt-auto">
          <Button 
            onClick={() => navigate(`/add-donation?campaignId=${campaign.id}`)}
            className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white text-xs h-9 shadow-sm rounded-lg"
          >
            {campaign.actionLabel}
          </Button>
          {campaign.secondaryActionLabel && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/add-donation?campaignId=${campaign.id}`)}
              className="flex-1 text-xs h-9 border-border/50 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              {campaign.secondaryActionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
