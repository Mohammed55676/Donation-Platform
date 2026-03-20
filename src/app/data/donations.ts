export interface Donation {
  id: string;
  title: string;
  description: string;
  category: 'ملابس' | 'طعام' | 'أثاث' | 'كتب' | 'أخرى';
  condition: 'جديد' | 'جيد جداً' | 'جيد' | 'مستعمل';
  location: string;
  urgency: 'عالية' | 'متوسطة' | 'منخفضة';
  image: string;
  donor: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  status: 'متاح' | 'محجوز' | 'تم التسليم';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  target: number;
  current: number;
  urgency: 'عالية' | 'متوسطة';
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  volunteers: number;
  maxVolunteers: number;
}

export const donations: Donation[] = [
  {
    id: '1',
    title: 'ملابس شتوية للأطفال',
    description: 'مجموعة من الملابس الشتوية للأطفال من عمر 5-10 سنوات، نظيفة وبحالة ممتازة',
    category: 'ملابس',
    condition: 'جيد جداً',
    location: 'الرياض',
    urgency: 'عالية',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500',
    donor: {
      name: 'أحمد محمد',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    createdAt: '2026-03-15',
    status: 'متاح'
  },
  {
    id: '2',
    title: 'كتب دراسية ومراجع',
    description: 'مجموعة من الكتب الدراسية والمراجع العلمية، مناسبة للمرحلة الثانوية',
    category: 'كتب',
    condition: 'جيد',
    location: 'جدة',
    urgency: 'متوسطة',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500',
    donor: {
      name: 'فاطمة علي',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    createdAt: '2026-03-14',
    status: 'متاح'
  },
  {
    id: '3',
    title: 'أثاث منزلي',
    description: 'طاولة طعام مع 4 كراسي، خشب طبيعي بحالة جيدة جداً',
    category: 'أثاث',
    condition: 'جيد جداً',
    location: 'الدمام',
    urgency: 'منخفضة',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
    donor: {
      name: 'خالد عبدالله',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    },
    createdAt: '2026-03-13',
    status: 'متاح'
  },
  {
    id: '4',
    title: 'مواد غذائية معلبة',
    description: 'صناديق من المواد الغذائية المعلبة، صالحة للاستخدام',
    category: 'طعام',
    condition: 'جديد',
    location: 'مكة المكرمة',
    urgency: 'عالية',
    image: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=500',
    donor: {
      name: 'سارة حسن',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
    createdAt: '2026-03-16',
    status: 'متاح'
  },
  {
    id: '5',
    title: 'ملابس رجالية رسمية',
    description: 'بدلات رسمية وقمصان، مناسبة للعمل والمناسبات',
    category: 'ملابس',
    condition: 'جيد جداً',
    location: 'الرياض',
    urgency: 'متوسطة',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
    donor: {
      name: 'محمد يوسف',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    createdAt: '2026-03-12',
    status: 'متاح'
  },
  {
    id: '6',
    title: 'أدوات مدرسية',
    description: 'حقائب مدرسية، أقلام، دفاتر، ومستلزمات دراسية متنوعة',
    category: 'أخرى',
    condition: 'جديد',
    location: 'جدة',
    urgency: 'عالية',
    image: 'https://images.unsplash.com/photo-1581447109200-bf2769116351?w=500',
    donor: {
      name: 'نورة أحمد',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100'
    },
    createdAt: '2026-03-17',
    status: 'متاح'
  },
  {
    id: '7',
    title: 'أجهزة إلكترونية',
    description: 'لابتوب وطابعة، تعمل بشكل جيد',
    category: 'أخرى',
    condition: 'جيد',
    location: 'الخبر',
    urgency: 'متوسطة',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    donor: {
      name: 'عبدالرحمن سعد',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'
    },
    createdAt: '2026-03-11',
    status: 'محجوز'
  },
  {
    id: '8',
    title: 'ملابس نسائية',
    description: 'ملابس نسائية متنوعة، نظيفة وبحالة ممتازة',
    category: 'ملابس',
    condition: 'جيد جداً',
    location: 'الطائف',
    urgency: 'منخفضة',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500',
    donor: {
      name: 'ليلى محمود',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    createdAt: '2026-03-10',
    status: 'متاح'
  }
];

export const campaigns: Campaign[] = [
  {
    id: '1',
    title: 'حملة الشتاء الدافئ',
    description: 'توفير ملابس شتوية للأسر المحتاجة',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80',
    target: 1000,
    current: 680,
    urgency: 'عالية'
  },
  {
    id: '2',
    title: 'حقيبة مدرسية',
    description: 'توفير المستلزمات الدراسية للطلاب',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=80',
    target: 500,
    current: 320,
    urgency: 'عالية'
  },
  {
    id: '3',
    title: 'إطعام مسكين',
    description: 'توزيع وجبات طعام للمحتاجين',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&q=80',
    target: 800,
    current: 450,
    urgency: 'متوسطة'
  }
];

export const volunteerOpportunities: VolunteerOpportunity[] = [
  {
    id: '1',
    title: 'توزيع الملابس على المحتاجين',
    description: 'نحتاج متطوعين للمساعدة في فرز وتوزيع الملابس المتبرع بها',
    location: 'الرياض',
    date: '2026-03-25',
    volunteers: 8,
    maxVolunteers: 15
  },
  {
    id: '2',
    title: 'تنظيم حملة جمع التبرعات',
    description: 'المساعدة في تنظيم حملة جمع التبرعات في الأحياء السكنية',
    location: 'جدة',
    date: '2026-03-28',
    volunteers: 5,
    maxVolunteers: 10
  },
  {
    id: '3',
    title: 'إعداد السلال الغذائية',
    description: 'تجهيز وتعبئة السلال الغذائية للأسر المحتاجة',
    location: 'الدمام',
    date: '2026-03-30',
    volunteers: 12,
    maxVolunteers: 20
  },
  {
    id: '4',
    title: 'زيارة دار الأيتام',
    description: 'تنظيم زيارة ترفيهية لدار الأيتام وتقديم الهدايا',
    location: 'مكة المكرمة',
    date: '2026-04-05',
    volunteers: 3,
    maxVolunteers: 8
  }
];