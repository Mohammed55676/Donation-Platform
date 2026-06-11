export type DonationType = 
  | "blood"
  | "food"
  | "furniture"
  | "clothes"
  | "medicine"
  | "money"
  | "volunteer"
  | "books"
  | "toys"
  | "all";

export interface CenterBranch {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  mapsUrl?: string;
  phone?: string;
  workingHours?: string;
  notes?: string;
}

export interface CenterContact {
  phone?: string;
  whatsapp?: string;
  website?: string;
  facebook?: string;
}

export type TrustedType = "charity" | "initiative" | "official";

export interface DonationCenter {
  id: string;
  name: string;
  category: string[];
  acceptedItems: string[];
  description: string;
  trustedType: TrustedType;
  pickupAvailable: boolean;
  cities: string[];
  branches: CenterBranch[];
  contact: CenterContact;
  notes?: string;
  isActive: boolean;
}

export type DonationCampaign = {
  id: string;
  title: string;
  organization: string;
  type: DonationType;
  description: string;
  tags: string[];
  isUrgent?: boolean;
  actionLabel: string;
  secondaryActionLabel?: string;
  imageUrl: string;
};

// Mock Data
export const mockCampaigns: DonationCampaign[] = [
  {
    id: "camp-1",
    title: "حملة تبرع بالدم لدعم الحالات العاجلة",
    organization: "بنك الدم - فرع عمان (بيانات تجريبية)",
    type: "blood",
    description: "مطلوب متبرعين بالدم بجميع الفصائل لدعم العمليات الجراحية والحالات الطارئة في المستشفيات.",
    tags: ["عاجل", "دم", "يتطلب شروط صحية"],
    isUrgent: true,
    actionLabel: "اعرف الشروط",
    secondaryActionLabel: "الاتجاهات",
    imageUrl: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80"
  },
  {
    id: "camp-2",
    title: "طرود غذائية للأسر المتعففة",
    organization: "تكية الخير (بيانات تجريبية)",
    type: "food",
    description: "ساهم معنا بتوفير مواد غذائية أساسية مثل الأرز، السكر، والزيت للأسر التي تحتاج لدعم مباشر.",
    tags: ["طعام", "تبرع أونلاين", "متاح طوال العام"],
    actionLabel: "تبرع الآن",
    secondaryActionLabel: "عرض التفاصيل",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80"
  },
  {
    id: "camp-3",
    title: "تبرع بأثاثك المستعمل بحالة جيدة",
    organization: "جمعية الإحسان (بيانات تجريبية)",
    type: "furniture",
    description: "نستقبل الأثاث المنزلي بحالة جيدة جداً لإعادة تأهيله وتوزيعه على الشباب المقبلين على الزواج والأسر المحتاجة.",
    tags: ["أثاث", "استلام من المنزل", "بحالة جيدة"],
    actionLabel: "احجز استلام",
    secondaryActionLabel: "واتساب",
    imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80"
  },
  {
    id: "camp-4",
    title: "حملة كسوة الشتاء والبطانيات",
    organization: "مركز التبرع المركزي (بيانات تجريبية)",
    type: "clothes",
    description: "نستقبل الملابس الشتوية الثقيلة، المعاطف، والبطانيات الجديدة أو المستعملة بحالة ممتازة.",
    tags: ["ملابس", "شتاء", "مفتوح اليوم"],
    actionLabel: "كيف تتبرع",
    imageUrl: "https://images.unsplash.com/photo-1489987707023-afc827081fac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80"
  }
];

export const mockCenters: DonationCenter[] = [
  {
    id: "bank-clothes-1",
    name: "بنك الملابس الخيري",
    category: ["ملابس", "أحذية", "ألعاب", "منسوجات"],
    acceptedItems: ["ملابس نظيفة", "أحذية بحالة جيدة", "شراشف", "أغطية", "ألعاب سليمة"],
    description: "جهة تستقبل التبرعات العينية وتعيد توزيعها على الأسر المحتاجة عبر صالة عرض تحفظ كرامة المنتفع.",
    trustedType: "charity",
    pickupAvailable: false,
    cities: ["عمّان", "المحافظات الأخرى"],
    isActive: true,
    branches: [
      {
        id: "b1",
        name: "المقر الرئيسي (صالة العرض)",
        city: "عمّان",
        area: "المحطة",
        address: "مجمع بنك الملابس الخيري",
        workingHours: "8:00 ص - 3:00 م (بحاجة للتحقق)",
        notes: "استقبال التبرعات مباشرة"
      },
      {
        id: "b2",
        name: "صناديق التبرع",
        city: "عمّان",
        area: "مولات مختارة (مثل مكة مول، سيتي مول)",
        address: "أماكن متفرقة (راجع الصفحة الرسمية)",
        notes: "صندوق مخصص للملابس والأحذية فقط، متوفر في أوقات عمل المول"
      }
    ],
    contact: {
      phone: "06-xxxxxxx (يحتاج توثيق)",
      website: "http://www.jhco.org.jo/",
      facebook: "https://www.facebook.com/JHCO.org"
    },
    notes: "يُفضّل التأكد من مواقع الصناديق الحالية وساعات العمل من الصفحة الرسمية قبل الذهاب."
  },
  {
    id: "fabricaid-1",
    name: "مؤسسة فابريك إيد (FabricAid)",
    category: ["ملابس", "أحذية", "منسوجات"],
    acceptedItems: ["ملابس مستعملة", "أحذية", "حقائب"],
    description: "مؤسسة اجتماعية تجمع الملابس المستعملة لإعادة تدويرها أو منحها حياة جديدة.",
    trustedType: "initiative",
    pickupAvailable: false,
    cities: ["عمّان"],
    isActive: true,
    branches: [
      {
        id: "b3",
        name: "صناديق فابريك إيد - فروع بنك الاتحاد",
        city: "عمّان",
        area: "فروع محددة",
        address: "داخل أو أمام فروع بنك الاتحاد المشاركة",
        workingHours: "حسب أوقات عمل الفرع",
        notes: "راجع صفحة FabricAid أو بنك الاتحاد للتأكد من الفروع"
      }
    ],
    contact: {
      website: "https://www.fabricaid.me/",
      facebook: "https://www.facebook.com/FabricAidME"
    }
  },
  {
    id: "zara-collection-1",
    name: "برنامج جمع الملابس - Zara",
    category: ["ملابس", "منسوجات", "أحذية"],
    acceptedItems: ["أي نوع من الملابس", "منسوجات", "أحذية", "إكسسوارات من أي علامة تجارية"],
    description: "صناديق مخصصة داخل متاجر زارا لجمع الملابس المستعملة لإعادة تدويرها بالتعاون مع جمعيات محلية.",
    trustedType: "official",
    pickupAvailable: false,
    cities: ["عمّان"],
    isActive: true,
    branches: [
      {
        id: "b4",
        name: "فرع تاج مول",
        city: "عمّان",
        area: "عبدون",
        address: "تاج مول - متجر Zara",
        workingHours: "10:00 ص - 10:00 م",
        notes: "يوجد صندوق داخل المتجر مخصص للتبرعات"
      },
      {
        id: "b5",
        name: "فرع سيتي مول",
        city: "عمّان",
        area: "دابوق",
        address: "سيتي مول - متجر Zara",
        workingHours: "10:00 ص - 10:00 م",
        notes: "يوجد صندوق داخل المتجر"
      }
    ],
    contact: {
      website: "https://www.zara.com/jo/"
    }
  },
  {
    id: "dwraha-balkhair-1",
    name: "مبادرة دورها بالخير",
    category: ["أثاث", "أجهزة كهربائية", "أدوات منزلية"],
    acceptedItems: ["غرف نوم", "كنب", "طاولات", "ثلاجات", "غسالات", "غازات تعمل"],
    description: "مبادرة نشطة في جمع وتجديد فائض الأثاث والأجهزة لتأمين بيوت الأسر العفيفة.",
    trustedType: "initiative",
    pickupAvailable: true,
    cities: ["عمّان", "الزرقاء"],
    isActive: true,
    branches: [
      {
        id: "b6",
        name: "الاستلام من المنزل",
        city: "عمّان",
        area: "جميع المناطق",
        address: "يتطلب تنسيق مسبق للاستلام من المنزل",
        notes: "نظراً لحجم التبرعات (أثاث)، يتم التنسيق للاستلام بسيارات المبادرة."
      }
    ],
    contact: {
      whatsapp: "(يحتاج توثيق)",
      facebook: "مبادرة دورها بالخير (فيسبوك)"
    },
    notes: "يرجى إرسال صور الأثاث أو الأجهزة عبر الواتساب لتنسيق موعد الاستلام."
  },
  {
    id: "jhco-1",
    name: "الهيئة الخيرية الأردنية الهاشمية",
    category: ["أثاث", "أجهزة كهربائية", "أدوات منزلية", "مستلزمات عامة"],
    acceptedItems: ["أجهزة أساسية", "سجاد", "مستلزمات منزلية صالحة للاستخدام"],
    description: "الهيئة الرسمية للإغاثة والأعمال الخيرية، تستقبل التبرعات العينية لتوزيعها على المحتاجين.",
    trustedType: "official",
    pickupAvailable: false,
    cities: ["عمّان"],
    isActive: true,
    branches: [
      {
        id: "b7",
        name: "المستودعات الرئيسية",
        city: "عمّان",
        area: "طبربور / المحطة (يحتاج توثيق الموقع الدقيق)",
        address: "مقر الهيئة الخيرية الأردنية الهاشمية",
        workingHours: "أوقات الدوام الرسمي",
        notes: "يجب التواصل المسبق لمعرفة إمكانية استقبال القطع الكبيرة."
      }
    ],
    contact: {
      phone: "+962 6 552 4666 (للتأكد)",
      website: "http://www.jhco.org.jo/"
    }
  },
  {
    id: "islamic-center-1",
    name: "جمعية المركز الإسلامي الخيرية",
    category: ["أثاث", "أجهزة كهربائية", "ملابس", "أدوات منزلية"],
    acceptedItems: ["أثاث بحالة جيدة", "أجهزة", "ملابس"],
    description: "تستقبل التبرعات العينية في فروعها وتقوم لجان الرعاية بفرزها وتوزيعها على العائلات المسجلة.",
    trustedType: "charity",
    pickupAvailable: false,
    cities: ["عمّان", "معظم المحافظات"],
    isActive: true,
    branches: [
      {
        id: "b8",
        name: "المراكز الفرعية",
        city: "عمّان",
        area: "مناطق متعددة",
        address: "راجع الموقع الرسمي لمعرفة أقرب فرع",
        workingHours: "8:00 ص - 3:00 م (تقريباً)",
        notes: "لجنة الرعاية في منطقتك تستطيع توجيهك."
      }
    ],
    contact: {
      phone: "+962 6 568 2599 (للتأكد)",
      website: "https://www.iccjo.org/"
    }
  },
  {
    id: "gaza-hashem-1",
    name: "جمعية غزة هاشم الخيرية",
    category: ["ألعاب", "قرطاسية", "حقائب", "ملابس"],
    acceptedItems: ["ألعاب بحالة جيدة", "حقائب مدرسية", "قرطاسية", "ملابس أطفال"],
    description: "تنظم حملات لجمع الألعاب والحقائب والقرطاسية لدعم الأطفال في المخيمات والمناطق الأقل حظاً.",
    trustedType: "charity",
    pickupAvailable: false,
    cities: ["عمّان", "جرش (مخيم غزة)"],
    isActive: true,
    branches: [
      {
        id: "b9",
        name: "المقر الرئيسي / الجمعية",
        city: "عمّان",
        area: "البقعة / عمان (يحتاج تحقق)",
        address: "يرجى التحقق من العنوان الدقيق",
        workingHours: "أوقات العمل الرسمية",
        notes: "تنشط التبرعات قبل المواسم المدرسية والأعياد."
      }
    ],
    contact: {
      phone: "(يحتاج توثيق)",
      facebook: "جمعية غزة هاشم الخيرية (فيسبوك)"
    }
  },
  {
    id: "koshk-1",
    name: "مبادرة كشك الثقافة العربية",
    category: ["كتب", "قرطاسية"],
    acceptedItems: ["كتب مستعملة", "روايات", "كتب علمية وثقافية"],
    description: "مبادرة تجمع الكتب المستعملة لإعادة توزيعها أو إقامة مكتبات عامة في المحافظات.",
    trustedType: "initiative",
    pickupAvailable: false,
    cities: ["عمّان"],
    isActive: true,
    branches: [
      {
        id: "b10",
        name: "كشك الثقافة (حسن أبو علي أو أكشاك وسط البلد)",
        city: "عمّان",
        area: "وسط البلد",
        address: "شارع فيصل",
        workingHours: "9:00 ص - 9:00 م",
        notes: "يرجى التنسيق المسبق لمعرفة إذا كانوا بحاجة لنوع الكتب."
      }
    ],
    contact: {
      phone: "(يحتاج توثيق)"
    }
  }
];
