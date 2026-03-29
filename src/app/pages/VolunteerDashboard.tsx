import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { MapView } from '../components/MapView';
import { useSearchParams } from 'react-router';
import {
  Truck, MapPin, CheckCircle, Clock, Package,
  Star, TrendingUp, Play, Navigation,
} from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  type: 'pickup' | 'delivery';
  title: string;
  donor: string;
  recipient: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'pending' | 'in_progress' | 'completed';
  urgency: 'high' | 'medium' | 'low';
  distance: string;
  items: string;
}

const mockTasks: Task[] = [
  {
    id: '1', type: 'pickup', title: 'استلام ملابس شتوية',
    donor: 'أحمد محمد', recipient: 'عائلة الأحمدي',
    pickupAddress: 'عمّان - عبدون', deliveryAddress: 'عمّان - دابوق',
    status: 'pending', urgency: 'high', distance: '3.2 كم', items: 'ملابس شتوية (15 قطعة)',
  },
  {
    id: '2', type: 'delivery', title: 'توصيل أدوات مدرسية',
    donor: 'نورة أحمد', recipient: 'مدرسة الأمل',
    pickupAddress: 'عمّان - الرابية', deliveryAddress: 'عمّان - شارع الجامعة',
    status: 'in_progress', urgency: 'medium', distance: '5.8 كم', items: 'حقائب وأدوات مدرسية (8 طلاب)',
  },
  {
    id: '3', type: 'delivery', title: 'توصيل مواد غذائية',
    donor: 'سارة حسن', recipient: 'أسرة الزهراني',
    pickupAddress: 'عمّان - الصويفية', deliveryAddress: 'عمّان - مرج الحمام',
    status: 'completed', urgency: 'high', distance: '2.1 كم', items: 'مواد غذائية معلبة (20 صندوق)',
  },
  {
    id: '4', type: 'pickup', title: 'استلام أثاث منزلي',
    donor: 'خالد عبدالله', recipient: 'عائلة السيد',
    pickupAddress: 'عمّان - تلاع العلي', deliveryAddress: 'عمّان - الأردن الجديد',
    status: 'pending', urgency: 'low', distance: '4.5 كم', items: 'طاولة وكراسي',
  },
];

const statusLabels = { pending: 'قيد الانتظار', in_progress: 'جارٍ التنفيذ', completed: 'مكتمل' };
const statusColors = {
  pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};
const urgencyColors = {
  high: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const urgencyLabels = { high: 'عاجل', medium: 'متوسط', low: 'منخفض' };

export function VolunteerDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;

  const updateTaskStatus = (id: string, newStatus: Task['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    const labels = { in_progress: 'بدأت المهمة!', completed: 'أحسنت! أتممت المهمة بنجاح 🎉' };
    toast.success(labels[newStatus as keyof typeof labels] ?? 'تم التحديث');
  };

  const setTab = (tab: string) => setSearchParams(tab === 'overview' ? {} : { tab });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-l from-secondary to-primary p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">مرحباً، {user?.name?.split(' ')[0]} 🙌</h2>
              <p className="text-white/80 text-sm">لديك {pending + inProgress} مهام تنتظر إنجازها</p>
            </div>
            <div className="text-4xl">🦸</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'مكتملة', value: completed, icon: '✅' },
              { label: 'جارية', value: inProgress, icon: '🔄' },
              { label: 'منتظرة', value: pending, icon: '⏳' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-xl">{s.icon}</div>
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-xs text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto rounded-xl p-1 bg-muted">
            <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-lg">مهامي ({pending + inProgress})</TabsTrigger>
            <TabsTrigger value="map" className="rounded-lg">الخريطة</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg">الملف الشخصي</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'إجمالي المهام', value: tasks.length, icon: Truck, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'جارية', value: inProgress, icon: Navigation, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                { label: 'مكتملة', value: completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
                { label: 'نقاط التطوع', value: '340 🏅', icon: Star, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                { label: 'تقييمي', value: '4.8 ⭐', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Progress of this month */}
            <Card>
              <CardHeader><CardTitle>تقدم هذا الشهر</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'المهام المكتملة', value: completed, max: tasks.length, color: 'bg-green-500' },
                  { label: 'المسافة المقطوعة', value: 18, max: 50, color: 'bg-blue-500', suffix: ' كم' },
                  { label: 'نقاط التطوع', value: 340, max: 500, color: 'bg-purple-500', suffix: ' نقطة' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value}{item.suffix ?? ''} / {item.max}{item.suffix ?? ''}</span>
                    </div>
                    <Progress value={(item.value / item.max) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TASKS */}
          <TabsContent value="tasks" className="mt-6">
            <div className="space-y-4">
              {tasks.filter((t) => t.status !== 'completed').map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${task.type === 'pickup' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        {task.type === 'pickup' ? <Package className="h-5 w-5 text-orange-500" /> : <Truck className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold">{task.title}</h3>
                          <Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
                          <Badge className={urgencyColors[task.urgency]}>{urgencyLabels[task.urgency]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{task.items}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            <span>استلام: {task.pickupAddress}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                            <span>تسليم: {task.deliveryAddress}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Navigation className="h-4 w-4" />
                            <span>{task.distance}</span>
                          </div>
                          <div className="flex gap-2">
                            {task.status === 'pending' && (
                              <Button size="sm" className="bg-primary text-white gap-1" onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                                <Play className="h-3.5 w-3.5" /> ابدأ المهمة
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => updateTaskStatus(task.id, 'completed')}>
                                <CheckCircle className="h-3.5 w-3.5" /> إتمام المهمة
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Completed tasks */}
              {tasks.filter((t) => t.status === 'completed').length > 0 && (
                <>
                  <h3 className="font-medium text-muted-foreground pt-2">المهام المكتملة</h3>
                  {tasks.filter((t) => t.status === 'completed').map((task) => (
                    <Card key={task.id} className="opacity-70">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.items} — {task.distance}</p>
                          </div>
                          <Badge className={statusColors.completed}>{statusLabels.completed}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          {/* MAP */}
          <TabsContent value="map" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>خريطة المهام</CardTitle>
                <CardDescription>مواقع الاستلام والتسليم لمهامك النشطة</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <MapView
                  center={[31.9539, 35.9106]}
                  zoom={12}
                  locations={[
                  { id: 'p1', title: 'استلام ملابس شتوية — عبدون', lat: 31.9762, lng: 35.8825, type: 'donation' },
                  { id: 'd1', title: 'تسليم ملابس شتوية — دابوق', lat: 31.9822, lng: 35.8535, type: 'request' },
                  { id: 'p2', title: 'استلام أدوات مدرسية — الرابية', lat: 31.9904, lng: 35.8742, type: 'donation' },
                  { id: 'd2', title: 'تسليم أدوات مدرسية — شارع الجامعة', lat: 31.9736, lng: 35.9037, type: 'request' },
                ]} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROFILE */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader><CardTitle>ملفي الشخصي كمتطوع</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{user?.name}</h3>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                    <Badge className="mt-1 bg-secondary/10 text-secondary">متطوع</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  {[
                    { label: 'مهام مكتملة', value: completed },
                    { label: 'نقاط التطوع', value: '340 🏅' },
                    { label: 'تقييمي', value: '4.8 ⭐' },
                    { label: 'مهام جارية', value: inProgress },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded-xl p-3 text-center">
                      <div className="text-xl font-bold">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
