import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Loader2, PhoneCall, CheckCircle, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  createdAt: string;
}

export function ConversationChat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conv, setConv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const myId = user?.id || user?._id;

  const fetchChat = async () => {
    try {
      const res = await api.get(`/conversations/${conversationId}/messages`);
      setConv(res.data.data.conversation);
      setMessages(res.data.data.messages || []);
    } catch (err: any) {
      toast.error('تعذّر تحميل المحادثة.');
      navigate('/messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchChat();
      // Simple polling for new messages since we removed socket for now
      const interval = setInterval(fetchChat, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending || conv?.status !== 'active') return;

    setSending(true);
    try {
      await api.post(`/conversations/${conversationId}/messages`, { message: text.trim() });
      setText('');
      fetchChat(); // Refresh instantly
    } catch (err) {
      toast.error('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const confirmAgreement = async () => {
    try {
      await api.put(`/conversations/${conversationId}/agreement`);
      toast.success('تم تأكيد الاتفاق من قبلك');
      fetchChat();
    } catch (err) {
      toast.error('تعذر تأكيد الاتفاق');
    }
  };

  const confirmDelivery = async () => {
    try {
      await api.put(`/conversations/${conversationId}/delivery`);
      toast.success('تم تأكيد التسليم من قبلك');
      fetchChat();
    } catch (err) {
      toast.error('تعذر تأكيد التسليم');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!conv) return null;

  const isRequester = conv.requester_id.id === myId;
  const otherUser = isRequester ? conv.receiver_id : conv.requester_id;
  const isPending = conv.status === 'pending';
  const isBlocked = conv.status === 'blocked';
  const isRejected = conv.status === 'rejected';

  const myAgreementConfirmed = conv.agreement_confirmed_by?.includes(myId);
  const otherAgreementConfirmed = conv.agreement_confirmed_by?.includes(otherUser.id);
  const bothAgreed = conv.agreed_at;

  const myDeliveryConfirmed = conv.delivery_confirmed_by?.includes(myId);
  const otherDeliveryConfirmed = conv.delivery_confirmed_by?.includes(otherUser.id);
  const bothDelivered = conv.delivered_at;

  return (
    <div className="min-h-[90vh] flex flex-col bg-muted/20">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} className="shrink-0">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 shrink-0 border">
            <AvatarImage src={otherUser.avatar || ''} alt={otherUser.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{otherUser.name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">{otherUser.name}</p>
            {conv.post_id && <p className="text-xs text-muted-foreground">بخصوص: {conv.post_id.title}</p>}
          </div>
        </div>
      </div>

      {/* ── Status Banner ── */}
      {isPending && (
        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 text-center text-sm border-b border-amber-200">
          بانتظار قبول الطرف الآخر لبدء المحادثة ومشاركة بيانات التواصل.
        </div>
      )}
      {isRejected && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 text-center text-sm border-b border-red-200">
          تم رفض هذا الطلب ولا يمكن التواصل.
        </div>
      )}
      {isBlocked && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 text-center text-sm border-b border-red-200 flex justify-center items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          تم حظر التواصل في هذه المحادثة.
        </div>
      )}
      {conv.status === 'active' && conv.phone_visible && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 text-center text-sm border-b border-green-200 flex flex-col sm:flex-row justify-center items-center gap-4">
          <span>تم قبول المحادثة. يمكنك الآن التواصل المباشر:</span>
          <a href={`tel:${otherUser.phone || ''}`} className="font-bold flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-800 rounded-full hover:bg-green-200 transition">
            <PhoneCall className="h-4 w-4" />
            {otherUser.phone || 'رقم غير متوفر'}
          </a>
        </div>
      )}

      {/* ── Agreement / Delivery Flow ── */}
      {conv.status === 'active' && conv.post_id && (
        <div className="bg-background border-b p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm z-0">
          <div className="text-sm space-y-1">
            <p className="font-semibold flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${bothAgreed ? 'text-green-600' : 'text-muted-foreground'}`} />
              حالة الاتفاق: {bothAgreed ? 'تم الاتفاق' : myAgreementConfirmed ? 'بانتظار تأكيد الطرف الآخر' : 'لم يتم التأكيد'}
            </p>
            <p className="font-semibold flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${bothDelivered ? 'text-green-600' : 'text-muted-foreground'}`} />
              حالة التسليم: {bothDelivered ? 'تم التسليم' : myDeliveryConfirmed ? 'بانتظار تأكيد الطرف الآخر' : 'لم يتم التأكيد'}
            </p>
          </div>
          <div className="flex gap-2">
            {!bothAgreed && (
              <Button size="sm" onClick={confirmAgreement} disabled={myAgreementConfirmed} variant={myAgreementConfirmed ? "secondary" : "default"}>
                {myAgreementConfirmed ? 'تم تأكيد الاتفاق (بانتظار الطرف الآخر)' : 'تأكيد الاتفاق'}
              </Button>
            )}
            {bothAgreed && !bothDelivered && (
              <Button size="sm" onClick={confirmDelivery} disabled={myDeliveryConfirmed} variant={myDeliveryConfirmed ? "secondary" : "default"}>
                {myDeliveryConfirmed ? 'تم تأكيد التسليم (بانتظار الطرف الآخر)' : 'تأكيد التسليم'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl w-full mx-auto space-y-4">
        {/* Render initial message as a system message or first user message */}
        <div className="flex flex-col items-center my-6">
          <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
            تم إرسال الطلب: {conv.first_message}
          </span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === myId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime()) ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: arSA }) : 'الآن'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t px-4 py-3 z-10">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={conv.status === 'active' ? "اكتب رسالتك..." : "لا يمكن إرسال رسائل حالياً"}
            className="flex-1 h-12 rounded-full px-5 bg-card"
            disabled={sending || conv.status !== 'active'}
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0"
            disabled={!text.trim() || sending || conv.status !== 'active'}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ConversationChat;
