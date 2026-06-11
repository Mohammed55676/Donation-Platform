import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DonationCenter } from '../../data/donationCenters';
import { MapPin, Phone, Globe, Facebook, MessageCircle, AlertCircle, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface CenterDetailsModalProps {
  center: DonationCenter | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CenterDetailsModal({ center, isOpen, onClose }: CenterDetailsModalProps) {
  if (!center) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="text-2xl font-bold">{center.name}</DialogTitle>
            {center.trustedType === 'official' && <Badge className="bg-emerald-100 text-emerald-700">جهة رسمية</Badge>}
            {center.trustedType === 'charity' && <Badge className="bg-blue-100 text-blue-700">جمعية موثقة</Badge>}
            {center.trustedType === 'initiative' && <Badge className="bg-purple-100 text-purple-700">مبادرة مجتمعية</Badge>}
          </div>
          <DialogDescription className="text-base text-muted-foreground">
            {center.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Categories and Accepted Items */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              ماذا يستقبلون؟
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1.5">فئات التبرع:</span>
                <div className="flex flex-wrap gap-2">
                  {center.category.map(cat => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1.5">الأشياء المقبولة والشروط:</span>
                <ul className="list-disc list-inside text-sm space-y-1 text-foreground/80">
                  {center.acceptedItems.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Furniture Warning */}
          {center.category.includes("أثاث") && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex gap-3 text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                <strong>تنبيه للأثاث والأجهزة الكبيرة:</strong> تتطلب هذه الجهة تنسيقاً مسبقاً قبل إرسال أو استلام الأثاث. يرجى التواصل معهم أولاً.
              </p>
            </div>
          )}

          {/* Branches */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              الفروع والصناديق المتاحة
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {center.branches.map(branch => (
                <div key={branch.id} className="border border-border p-4 rounded-xl bg-card hover:border-primary/30 transition-colors">
                  <h5 className="font-bold text-sm mb-1">{branch.name}</h5>
                  <p className="text-xs text-muted-foreground mb-2">{branch.city} - {branch.area}</p>
                  
                  <div className="space-y-1.5 text-xs">
                    <p><span className="font-medium">العنوان:</span> {branch.address}</p>
                    {branch.workingHours && (
                      <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> {branch.workingHours}</p>
                    )}
                    {branch.notes && (
                      <p className="text-muted-foreground bg-muted p-1.5 rounded mt-2">{branch.notes}</p>
                    )}
                  </div>

                  {(branch.mapsUrl || branch.phone) && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                      {branch.mapsUrl && (
                        <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => window.open(branch.mapsUrl, '_blank')}>
                          <Navigation className="h-3 w-3 me-1" /> خرائط
                        </Button>
                      )}
                      {branch.phone && (
                        <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => window.open(`tel:${branch.phone}`)}>
                          <Phone className="h-3 w-3 me-1" /> اتصال
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          {(center.contact.phone || center.contact.whatsapp || center.contact.website || center.contact.facebook) && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                معلومات التواصل
              </h4>
              <div className="flex flex-wrap gap-2">
                {center.contact.whatsapp && (
                  <Button variant="outline" onClick={() => window.open(`https://wa.me/${center.contact.whatsapp}`, '_blank')} className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400">
                    <MessageCircle className="h-4 w-4" /> واتساب
                  </Button>
                )}
                {center.contact.phone && (
                  <Button variant="outline" onClick={() => window.open(`tel:${center.contact.phone}`)} className="gap-2">
                    <Phone className="h-4 w-4" /> {center.contact.phone}
                  </Button>
                )}
                {center.contact.website && (
                  <Button variant="outline" onClick={() => window.open(center.contact.website, '_blank')} className="gap-2 text-blue-600 hover:text-blue-700">
                    <Globe className="h-4 w-4" /> الموقع الإلكتروني
                  </Button>
                )}
                {center.contact.facebook && (
                  <Button variant="outline" onClick={() => window.open(center.contact.facebook, '_blank')} className="gap-2 text-blue-600 hover:text-blue-700">
                    <Facebook className="h-4 w-4" /> فيسبوك
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {center.notes && (
            <p className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border border-dashed">
              <strong>ملاحظة:</strong> {center.notes}
            </p>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
