require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('./models/User.model');
const Donation = require('./models/Donation.model');
const Campaign = require('./models/Campaign.model');
const CommunityRequest = require('./models/CommunityRequest.model');
const VolunteerOpportunity = require('./models/VolunteerOpportunity.model');
const DonationRequest = require('./models/DonationRequest.model');
const DonorOffer = require('./models/DonorOffer.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/donation_platform';

// SAFETY CHECK
if (process.env.NODE_ENV === 'production') {
    console.error('❌ DANGER: You are trying to run the seed script in production!');
    console.error('If you really want to do this, change NODE_ENV manually.');
    process.exit(1);
}

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB.');

    console.log('Clearing existing development data...');
    await User.deleteMany({});
    await Donation.deleteMany({});
    await Campaign.deleteMany({});
    await CommunityRequest.deleteMany({});
    await VolunteerOpportunity.deleteMany({});
    await DonationRequest.deleteMany({});
    await DonorOffer.deleteMany({});

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

    const donor1 = await User.create({
      name: 'أحمد محمود',
      email: 'ahmad@example.com',
      password: 'Password123!',
      role: 'user',
      location: 'إربد',
      phone: '0781111111',
    });

    const donor2 = await User.create({
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

    console.log('🌱 Seeding 5 physical donations...');
    await Donation.create({
      title: 'حزمة ملابس شتوية',
      description: 'معاطف شتوية لم تستخدم كثيراً، مناسبة للأعمار 10-14 سنة.',
      category: 'ملابس',
      condition: 'جيد جداً',
      location: 'عمان',
      urgency: 'متوسطة',
      status: 'متاح',
      donor: donor1._id,
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop'
    });

    await Donation.create({
      title: 'مجموعة كتب مدرسية',
      description: 'كتب منهاج الصف الثامن بحالة ممتازة للفصلين.',
      category: 'كتب',
      condition: 'جيد',
      location: 'إربد',
      urgency: 'منخفضة',
      status: 'متاح',
      donor: donor2._id,
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2070&auto=format&fit=crop'
    });

    await Donation.create({
      title: 'طرود غذائية',
      description: '10 طرود غذائية تحتوي على أساسيات المطبخ (أرز، سكر، زيت).',
      category: 'طعام',
      condition: 'جديد',
      location: 'عمان',
      urgency: 'عالية',
      status: 'متاح',
      donor: donor1._id,
      image: 'https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?q=80&w=2070&auto=format&fit=crop'
    });

    await Donation.create({
      title: 'طاولة طعام وكراسي',
      description: 'طاولة طعام خشبية مع 4 كراسي، التبرع بسبب النقل لبيت جديد.',
      category: 'أثاث',
      condition: 'مستعمل',
      location: 'الزرقاء',
      urgency: 'متوسطة',
      status: 'متاح',
      donor: donor2._id,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop'
    });

    await Donation.create({
      title: 'كرسي متحرك',
      description: 'كرسي متحرك طبي قابل للطي بحالة ممتازة.',
      category: 'أخرى', // assuming medical isn't standard enum in the model
      condition: 'جيد جداً',
      location: 'عمان',
      urgency: 'عالية',
      status: 'متاح',
      donor: donor1._id,
      image: 'https://images.unsplash.com/photo-1581090464707-f2bc34310738?q=80&w=2070&auto=format&fit=crop'
    });

    console.log('🌱 Seeding 3 campaigns...');
    await Campaign.create({
      title: 'حملة دفء الشتاء',
      description: 'مبادرة لتوزيع البطانيات والملابس الشتوية والمدافئ للأسر العفيفة في المحافظات.',
      target: 20000,
      current: 18000,
      urgency: 'عالية',
      status: 'active',
      isActive: true,
      charityId: charity1._id,
      createdBy: charity1._id,
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?q=80&w=2070&auto=format&fit=crop'
    });

    await Campaign.create({
      title: 'حقيبة الطالب',
      description: 'تجهيز الحقائب المدرسية والقرطاسية لأبناء الأسر المحتاجة قبل بداية العام الدراسي.',
      target: 10000,
      current: 4500,
      urgency: 'متوسطة',
      status: 'active',
      isActive: true,
      charityId: charity2._id,
      createdBy: charity2._id,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2070&auto=format&fit=crop'
    });

    await Campaign.create({
      title: 'دعم العمليات الجراحية',
      description: 'حملة طارئة لتغطية تكاليف العمليات الجراحية المستعجلة لغير المقتدرين.',
      target: 50000,
      current: 12500,
      urgency: 'عالية',
      status: 'active',
      isActive: true,
      charityId: charity1._id,
      createdBy: charity1._id,
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop'
    });

    console.log('🌱 Seeding 3 volunteer opportunities...');
    await VolunteerOpportunity.create({
      title: 'توزيع طرود الخير',
      description: 'شارك معنا في توزيع الطرود الغذائية على المحتاجين في المناطق الأقل حظاً.',
      location: 'عمان - شرق العاصمة',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      maxVolunteers: 20,
      volunteers: 5,
      isActive: true,
      createdBy: charity1._id,
      applicants: [donor1._id],
    });

    await VolunteerOpportunity.create({
      title: 'فرز وتصنيف الملابس',
      description: 'مطلوب متطوعين للعمل داخل مستودع الجمعية لفرز الملابس المتبرع بها وتجهيزها للتوزيع.',
      location: 'إربد',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      maxVolunteers: 10,
      volunteers: 10, // Full
      isActive: true,
      createdBy: charity2._id,
      applicants: [],
    });

    await VolunteerOpportunity.create({
      title: 'حملة توعوية طبية',
      description: 'نبحث عن متطوعين من المجال الطبي (أطباء وممرضين) للمشاركة في يوم طبي مجاني.',
      location: 'الزرقاء',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 2 weeks
      maxVolunteers: 15,
      volunteers: 3,
      isActive: true,
      createdBy: charity1._id,
      applicants: [donor2._id],
    });

    console.log('🌱 Seeding Donation Requests & Donor Offers...');
    const req1 = await DonationRequest.create({
        title: 'بحاجة لـ 50 بطانية شتوية',
        description: 'استعداداً للمنخفض القادم، نجمع بطانيات شتوية.',
        category: 'أخرى',
        quantityNeeded: 50,
        quantityReceived: 5,
        urgency: 'عالية',
        location: 'عمان',
        status: 'active',
        charityId: charity1._id,
        createdBy: charity1._id,
    });

    await DonorOffer.create({
        donationRequestId: req1._id,
        donorId: donor1._id,
        charityId: charity1._id,
        offeredItem: 'بطانيات شتوية',
        offeredQuantity: 5,
        condition: 'جديد',
        message: 'لدي 5 بطانيات جاهزة للتسليم فوراً.',
        status: 'received'
    });

    await DonorOffer.create({
        donationRequestId: req1._id,
        donorId: donor2._id,
        charityId: charity1._id,
        offeredItem: 'ألحفة',
        offeredQuantity: 2,
        condition: 'جيد جداً',
        message: 'يمكنني المساعدة بـ 2.',
        status: 'new'
    });

    console.log('✅ Database seeded successfully!');
    console.log('---');
    console.log('Admin: admin@example.com / Password123!');
    console.log('Donor: ahmad@example.com / Password123!');
    console.log('Charity: ihsan@example.com / Password123!');
    console.log('---');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
