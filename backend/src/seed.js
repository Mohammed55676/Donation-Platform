require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('./models/User.model');
const Donation = require('./models/Donation.model');
const Campaign = require('./models/Campaign.model');
const CommunityRequest = require('./models/CommunityRequest.model');
const VolunteerOpportunity = require('./models/VolunteerOpportunity.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/donation_platform';

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB.');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Donation.deleteMany({});
    await Campaign.deleteMany({});
    await CommunityRequest.deleteMany({});
    await VolunteerOpportunity.deleteMany({});

    console.log('🌱 Seeding users...');
    
    // Seed Admin
    const admin = await User.create({
      name: 'مدير النظام',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin',
      location: 'عمان',
      phone: '0790000000',
    });

    const user1 = await User.create({
      name: 'أحمد محمود',
      email: 'ahmad@example.com',
      password: 'Password123!',
      role: 'user',
      location: 'إربد',
      phone: '0781111111',
    });

    const user2 = await User.create({
      name: 'سارة خالد',
      email: 'sara@example.com',
      password: 'Password123!',
      role: 'user',
      location: 'الزرقاء',
      phone: '0772222222',
    });

    const charity1 = await User.create({
      name: 'جمعية الإحسان الخيرية',
      email: 'ihsan@example.com',
      password: 'Password123!',
      role: 'user',
      user_type: 'charity',
      charityStatus: 'verified',
      isVerified: true,
      charityBadge: true,
      location: 'عمان',
      phone: '065000000',
      avatar: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop'
    });

    const charity2 = await User.create({
      name: 'مؤسسة الأمل للإغاثة',
      email: 'amal@example.com',
      password: 'Password123!',
      role: 'user',
      user_type: 'charity',
      charityStatus: 'verified',
      isVerified: true,
      charityBadge: true,
      location: 'إربد',
      phone: '027000000',
      avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop'
    });

    console.log('🌱 Seeding donations...');
    const donation1 = await Donation.create({
      title: 'ملابس شتوية بحالة ممتازة',
      description: 'ثلاث معاطف شتوية لم تستخدم كثيراً، مناسبة للأعمار 10-14 سنة.',
      category: 'ملابس',
      condition: 'جيد جداً',
      location: 'عمان',
      urgency: 'متوسطة',
      status: 'متاح',
      donor: user1._id,
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop'
    });

    const donation2 = await Donation.create({
      title: 'أثاث منزلي متكامل',
      description: 'طقم جلوس وطاولة طعام لـ 6 أشخاص، التبرع بسبب النقل.',
      category: 'أثاث',
      condition: 'جيد',
      location: 'إربد',
      urgency: 'منخفضة',
      status: 'قيد المراجعة',
      donor: user2._id,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop'
    });

    const donation3 = await Donation.create({
      title: 'وجبات غذائية مغلفة',
      description: '50 وجبة غداء مغلفة وجاهزة للتوزيع الخيري.',
      category: 'طعام',
      condition: 'جديد',
      location: 'عمان',
      urgency: 'عالية',
      status: 'متاح',
      donor: user1._id,
      image: 'https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?q=80&w=2070&auto=format&fit=crop'
    });

    console.log('🌱 Seeding campaigns...');
    await Campaign.create({
      title: 'إطعام مسكين',
      description: 'حملة لتوفير وجبات غذائية للأسر المتعففة خلال هذا الشهر الفضيل.',
      target: 50000,
      current: 12500,
      urgency: 'عالية',
      isActive: true,
      createdBy: admin._id,
      image: 'https://as2.ftcdn.net/v2/jpg/04/87/15/31/1000_F_487153177_XJ9ZtM4gG30M67uJgA7B5hOBy6lT7dI9.jpg'
    });

    await Campaign.create({
      title: 'كسوة الشتاء',
      description: 'مبادرة لتوزيع البطانيات والملابس الشتوية للمحتاجين.',
      target: 20000,
      current: 18000,
      urgency: 'متوسطة',
      isActive: true,
      createdBy: admin._id,
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?q=80&w=2070&auto=format&fit=crop'
    });

    console.log('🌱 Seeding community requests...');
    await CommunityRequest.create({
      title: 'بحاجة ماسة إلى جهاز تنفس',
      description: 'والدي يحتاج إلى جهاز تنفس منزلي بشكل عاجل، نرجو المساعدة لمن يتوفر لديه.',
      category: 'طبي',
      urgency: 'عالية',
      status: 'متاح',
      location: 'الزرقاء',
      requestedBy: user2._id,
      likes: [user1._id],
    });

    await CommunityRequest.create({
      title: 'توفير حقائب مدرسية للأيتام',
      description: 'نقوم بتجهيز أبنائنا الأيتام للعام الدراسي الجديد ونحتاج لدعمكم.',
      category: 'أخرى',
      urgency: 'متوسطة',
      status: 'تم الاتفاق',
      location: 'إربد',
      requestedBy: user1._id,
      likes: [],
    });

    console.log('🌱 Seeding volunteer opportunities...');
    await VolunteerOpportunity.create({
      title: 'توزيع وجبات الإفطار',
      description: 'شارك معنا في توزيع الوجبات على المحتاجين عند إشارات المرور والمساجد.',
      location: 'عمان',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      maxVolunteers: 20,
      volunteers: 5,
      isActive: true,
      createdBy: admin._id,
      applicants: [user1._id, user2._id],
    });

    await VolunteerOpportunity.create({
      title: 'تنظيم المستودع الخيري',
      description: 'نحتاج لمساعدتكم في فرز وترتيب الملابس المتبرع بها في المستودع الرئيسي.',
      location: 'إربد',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      maxVolunteers: 10,
      volunteers: 10, // Full
      isActive: true,
      createdBy: admin._id,
      applicants: [],
    });

    console.log('✅ Database seeded successfully!');
    console.log('---');
    console.log('You can now log in with:');
    console.log('Admin: admin@example.com / Password123!');
    console.log('User: ahmad@example.com / Password123!');
    console.log('---');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
