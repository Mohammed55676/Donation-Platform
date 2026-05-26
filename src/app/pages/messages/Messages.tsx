import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { MessageSquare, Check, X, Ban, UserCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  post_id: { id: string; title: string; status: string };
  requester_id: { id: string; name: string; avatar?: string };
  receiver_id: { id: string; name: string; avatar?: string };
  status: string;
  first_message?: string;
  last_message_at?: string;
  createdAt: string;
}

export function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeConvs, setActiveConvs] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [convRes, reqRes] = await Promise.all([
        api.get('/conversations'),
        api.get('/conversations/requests')
      ]);
      setActiveConvs(convRes.data.data || []);
      setRequests(reqRes.data.data || []);
    } catch (err) {
      console.error('Error fetching messages data', err);
      toast.error('حدث خطأ أثناء تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.put(`/conversations/${id}/accept`);
      toast.success('تم قبول الطلب');
      fetchAll();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/conversations/${id}/reject`);
      toast.success('تم رفض الطلب');
      fetchAll();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const handleBlock = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حظر هذا المستخدم؟")) return;
    try {
      await api.put(`/conversations/${id}/block`);
      toast.success('تم الحظر بنجاح');
      fetchAll();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const myId = user?.id || user?._id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        الرسائل
      </h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="active" className="text-base font-semibold">المحادثات</TabsTrigger>
          <TabsTrigger value="requests" className="text-base font-semibold">
            طلبات المراسلة
            {requests.length > 0 && (
              <span className="ms- bg-destructive text-white text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : activeConvs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">لا توجد محادثات نشطة.</div>
          ) : (
            <div className="grid gap-4">
              {activeConvs.map(conv => {
                const isRequester = conv.requester_id.id === myId;
                const otherUser = isRequester ? conv.receiver_id : conv.requester_id;
                
                return (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/messages/${conv.id}`)}
                    className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={otherUser.avatar} />
                      <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold truncate text-base">{otherUser.name}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: arSA }) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.post_id ? `بخصوص: ${conv.post_id.title}` : 'تواصل مباشر'}
                      </p>
                      {conv.status === 'pending' && <p className="text-xs text-amber-600 mt-1">بانتظار القبول...</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">لا توجد طلبات مراسلة جديدة.</div>
          ) : (
            <div className="grid gap-4">
              {requests.map(req => (
                <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border bg-card">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={req.requester_id.avatar} />
                    <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate text-base">{req.requester_id.name}</h3>
                    <p className="text-sm font-medium mt-1">يريد التواصل بخصوص: {req.post_id ? req.post_id.title : 'طلب غير محدد'}</p>
                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded-md italic">"{req.first_message}"</p>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    <Button size="sm" className="flex-1 gap-1" onClick={() => handleAccept(req.id)}>
                      <Check className="h-4 w-4" /> قبول
                    </Button>
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleReject(req.id)}>
                        <X className="h-4 w-4" /> رفض
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleBlock(req.id)}>
                        <Ban className="h-4 w-4" /> حظر
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Messages;
