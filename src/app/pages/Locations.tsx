import { MapPin, Building2, Store, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const donationLocations = [
  {
    type: 'صناديق بنك الملابس الخيري',
    icon: <Heart className="w-6 h-6 text-primary" />,
    locations: [
      'مكة مول',
      'سيتي مول',
      'تاج مول',
      'جاليريا مول',
      'كوزمو (الدوار السابع)'
    ]
  },
  {
    type: 'حاويات FabricAID',
    icon: <Store className="w-6 h-6 text-green-500" />,
    locations: [
      'عبدون (قرب تاج مول)',
      'خلدا (دوار العساف)',
      'الشميساني (خلف السيفوي)'
    ]
  },
  {
    type: 'فروع بنوك لتقديم التبرعات النقدية',
    icon: <Building2 className="w-6 h-6 text-blue-500" />,
    locations: [
      'البنك الإسلامي الأردني (كافة الفروع)',
      'بنك الإسكان (كافة الفروع)',
      'البنك العربي (كافة الفروع)'
    ]
  }
];

export function Locations() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">أماكن التبرع</h1>
        <p className="text-xl text-muted-foreground">
          تعرف على أقرب المواقع وصناديق التبرع في مختلف أنحاء الأردن
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {donationLocations.map((category, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6 bg-primary/5 p-3 rounded-xl">
              {category.icon}
              <h2 className="text-xl font-bold">{category.type}</h2>
            </div>
            
            <ul className="space-y-4">
              {category.locations.map((loc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-foreground">{loc}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
