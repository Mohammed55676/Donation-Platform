import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  MessageSquare, UserCircle, Loader2, RefreshCw, Search,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface ConvUser {
  id?: string;
  _id?: string;
  name: string;
  avatar?: string;
  phone?: string;
}

interface ConvPost {
  id?: string;
  _id?: string;
  title: string;
}

interface Conversation {
  id?: string;
  _id?: string;
  requester_id: ConvUser;
  receiver_id: ConvUser;
  post_id?: ConvPost | null;
  first_message: string;
  status: 'pending' | 'active' | 'rejected' | 'blocked' | 'closed';
  last_message_at?: string;
  createdAt: string;
}

function getId(obj?: { id?: string; _id?: string } | null): string {
  return obj?.id ?? obj?._id ?? '';
}

const STATUS_CONFIG = {
  pending:  { label: 'معلق',   cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  active:   { label: 'نشط',    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected: { label: 'مرفوض', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  blocked:  { label: 'محظور', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
  closed:   { label: 'مغلق',  cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
} as const;

export function MessagesCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const myId = getId(user as any);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/conversations');
      setConversations(res.data.data || []);
    } catch {
      // no-op — keep empty list, user will see empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  function getOtherUser(conv: Conversation): ConvUser {
    return getId(conv.requester_id as any) === myId
      ? conv.receiver_id
      : conv.requester_id;
  }

  const filtered = conversations.filter(conv => {
    const other = getOtherUser(conv);
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingCount = conversations.filter(c => c.status === 'pending').length;

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            الرسائل
            {pendingCount > 0 && (
              <Badge className="bg-amber-500 text-white border-none">{pendingCount}</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'جاري التحميل...' :
             conversations.length > 0 ? `${conversations.length} محادثة` : 'لا توجد محادثات'}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          onClick={fetchConversations}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="ابحث في المحادثات..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pr-9 h-11 rounded-xl"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">جاري تحميل المحادثات...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground opacity-40" />
          </div>
          <div>
            <p className="font-semibold text-lg">
              {searchQuery ? 'لا نتائج' : 'لا توجد محادثات بعد'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? 'جرّب بحثاً آخر'
                : 'يمكنك بدء محادثة مع جمعية موثقة من تبويب البحث عن جمعيات أو من صفحة تفاصيل التبرع.'}
            </p>
          </div>
        </div>
      )}

      {/* Conversation list */}
      {!loading && filtered.length > 0 && (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-2 pb-4">
            {filtered.map(conv => {
              const convId = getId(conv as any);
              const other = getOtherUser(conv);
              const statusCfg = STATUS_CONFIG[conv.status] ?? STATUS_CONFIG.closed;
              const isPending = conv.status === 'pending';
              const isRequester = getId(conv.requester_id as any) === myId;
              const needsReply = isPending && !isRequester;
              const timeStr = conv.last_message_at || conv.createdAt;

              return (
                <button
                  key={convId}
                  onClick={() => navigate(`/messages/${convId}`)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-white dark:bg-[#1A2332]/60 hover:bg-muted/40 hover:border-primary/30 hover:shadow-sm transition-all text-right group"
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border shrink-0">
                    <AvatarImage src={other?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {other?.name?.slice(0, 2) || <UserCircle className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                        {other?.name || 'مستخدم'}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ms-2">
                        {timeStr
                          ? formatDistanceToNow(new Date(timeStr), { addSuffix: true, locale: arSA })
                          : ''}
                      </span>
                    </div>

                    {conv.post_id && (
                      <p className="text-xs text-primary font-medium mb-0.5 truncate">
                        بخصوص: {conv.post_id.title}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conv.first_message}
                      </p>
                      <Badge className={`text-[10px] border-none flex-shrink-0 px-2 py-0.5 ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </Badge>
                    </div>

                    {needsReply && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        طلب جديد يحتاج ردك
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
