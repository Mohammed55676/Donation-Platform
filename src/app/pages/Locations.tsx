import { motion } from 'motion/react';
import { MapView, type MapLocation } from '../components/MapView';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Locations() {
  const locations: MapLocation[] = [
    { id: '1', title: 'المركز الرئيسي - عمّان', lat: 31.9539, lng: 35.9106, type: 'donation', address: 'شارع مكة، عمارة رقم 52' },
    { id: '2', title: 'فرع إربد', lat: 32.5514, lng: 35.8515, type: 'donation', address: 'دوار الجامعة، بجانب المجمع' },
    { id: '3', title: 'فرع الزرقاء', lat: 32.0728, lng: 36.0880, type: 'donation', address: 'شارع السعادة، مقابل البريد' },
    { id: '4', title: 'مستودع العقبة', lat: 29.5319, lng: 35.0061, type: 'donation', address: 'المنطقة الصناعية' }
  ];

  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">أماكن ومراكز التبرع</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            تفضل بزيارة أقرب فرع إليك لتسليم تبرعاتك يدوياً، أو الاطلاع على صناديق جمع التبرعات في المحافظات.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pe-2">
            {locations.map((loc, i) => (
              <motion.div key={loc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-none card-shadow rounded-2xl hover:shadow-lg hover:shadow-primary/10 transition-all">
                  <CardContent className="p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{loc.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{loc.address}</p>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        <Navigation className="me-1.5 h-3 w-3" /> الحصول على الاتجاهات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 rounded-3xl overflow-hidden border-none card-shadow h-[400px] lg:h-[600px]">
            <MapView 
              center={[31.9539, 35.9106]} 
              zoom={7} 
              locations={locations} 
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
