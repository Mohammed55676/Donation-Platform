export type DonationType = 
  | "blood"
  | "food"
  | "furniture"
  | "clothes"
  | "medicine"
  | "money"
  | "volunteer"
  | "all";

export type DeliveryMethod =
  | "self_delivery"
  | "home_pickup"
  | "online"
  | "mobile_campaign";

export type CenterType =
  | "hospital"
  | "blood_bank"
  | "food_bank"
  | "charity"
  | "takeya"
  | "volunteer_center";

export type DonationCenter = {
  id: string;
  name: string;
  centerType: CenterType;
  address: string;
  city: string;
  lat: number;
  lng: number;
  acceptedTypes: DonationType[];
  deliveryMethods: DeliveryMethod[];
  phone?: string;
  whatsapp?: string;
  openingHours: string;
  isOpen: boolean;
  isUrgent?: boolean;
  requiresAppointment?: boolean;
  distanceKm?: number;
  description: string;
};

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
    id: "center-1",
    name: "بنك الدم الرئيسي - عمّان",
    centerType: "blood_bank",
    address: "شارع المستشفى، عمّان",
    city: "عمان",
    lat: 31.9539,
    lng: 35.9106,
    acceptedTypes: ["blood"],
    deliveryMethods: ["self_delivery"],
    phone: "06-555-0001",
    openingHours: "مفتوح 24 ساعة",
    isOpen: true,
    isUrgent: true,
    description: "يستقبل التبرعات بالدم لتغذية مخزون المستشفيات الحكومية والخاصة. (بيانات تجريبية)"
  },
  {
    id: "center-2",
    name: "مستودع الأثاث الخيري",
    centerType: "charity",
    address: "المنطقة الصناعية، الزرقاء",
    city: "الزرقاء",
    lat: 32.0728,
    lng: 36.0880,
    acceptedTypes: ["furniture", "clothes"],
    deliveryMethods: ["self_delivery", "home_pickup"],
    whatsapp: "962790000002",
    openingHours: "8:00 ص - 4:00 م",
    isOpen: true,
    requiresAppointment: true,
    description: "مستودع رئيسي لاستلام الأثاث والأجهزة الكهربائية وتخزين الملابس. (بيانات تجريبية)"
  },
  {
    id: "center-3",
    name: "مركز الطعام المتكامل",
    centerType: "food_bank",
    address: "شارع الجامعة، إربد",
    city: "إربد",
    lat: 32.5514,
    lng: 35.8515,
    acceptedTypes: ["food", "money"],
    deliveryMethods: ["self_delivery", "online"],
    phone: "02-555-0003",
    openingHours: "9:00 ص - 5:00 م",
    isOpen: false,
    description: "استقبال التبرعات العينية من المواد الغذائية الجافة وتمويل الطرود. (بيانات تجريبية)"
  },
  {
    id: "center-4",
    name: "تكية الخير للإطعام",
    centerType: "takeya",
    address: "وسط البلد، العقبة",
    city: "العقبة",
    lat: 29.5319,
    lng: 35.0061,
    acceptedTypes: ["food", "volunteer"],
    deliveryMethods: ["self_delivery", "mobile_campaign"],
    whatsapp: "962770000004",
    openingHours: "10:00 ص - 6:00 م",
    isOpen: true,
    description: "تقديم وجبات ساخنة يومية. نرحب بالمتطوعين للمساعدة في التغليف. (بيانات تجريبية)"
  },
  {
    id: "center-5",
    name: "الجمعية الطبية للمحتاجين",
    centerType: "charity",
    address: "الكرك، الشارع الرئيسي",
    city: "الكرك",
    lat: 31.1811,
    lng: 35.7042,
    acceptedTypes: ["medicine", "money"],
    deliveryMethods: ["self_delivery", "online"],
    phone: "03-555-0005",
    openingHours: "8:00 ص - 2:00 م",
    isOpen: true,
    description: "نستقبل الأدوية غير منتهية الصلاحية ليتم فحصها وتوزيعها مجاناً. (بيانات تجريبية)"
  },
  {
    id: "center-6",
    name: "مركز الدعم المجتمعي",
    centerType: "volunteer_center",
    address: "جبل الحسين، عمّان",
    city: "عمان",
    lat: 31.9631,
    lng: 35.9142,
    acceptedTypes: ["volunteer", "clothes"],
    deliveryMethods: ["self_delivery", "home_pickup"],
    whatsapp: "962780000006",
    openingHours: "10:00 ص - 8:00 م",
    isOpen: true,
    requiresAppointment: false,
    description: "نقطة تجمع للمتطوعين واستلام الملابس لتوزيعها أسبوعياً. (بيانات تجريبية)"
  },
  {
    id: "center-7",
    name: "مستشفى الأمل - قسم التبرعات",
    centerType: "hospital",
    address: "دوار الداخلية، عمّان",
    city: "عمان",
    lat: 31.9654,
    lng: 35.9126,
    acceptedTypes: ["blood", "money"],
    deliveryMethods: ["self_delivery"],
    phone: "06-555-0007",
    openingHours: "مفتوح 24 ساعة",
    isOpen: true,
    isUrgent: true,
    description: "مطلوب وحدات دم بشكل عاجل لفئة O سالب. (بيانات تجريبية)"
  }
];
