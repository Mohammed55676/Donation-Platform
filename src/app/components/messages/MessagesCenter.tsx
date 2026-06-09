import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, Mic, Paperclip, Smile, Send, Phone, Video, 
  MoreVertical, Check, CheckCheck, Info, UserCircle, 
  Image as ImageIcon, FileText, X, MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { OnlinePresenceIndicator } from './OnlinePresenceIndicator';
import { BeneficiaryProfileModal } from '../community/BeneficiaryProfileModal';

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'voice' | 'file';
  attachmentUrl?: string;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'busy' | 'away';
    lastSeen?: Date;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isTyping?: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    user: { id: 'u1', name: 'أحمد محمود', status: 'online' },
    lastMessage: 'تمام، هكون موجود في الموعد إن شاء الله',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    unreadCount: 2,
    isTyping: true
  },
  {
    id: '2',
    user: { id: 'u2', name: 'سارة عبدالرحمن', status: 'away', lastSeen: new Date(Date.now() - 1000 * 60 * 30) },
    lastMessage: 'شكراً جزيلاً لك',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 0
  },
  {
    id: '3',
    user: { id: 'u3', name: 'خالد عبدالله', status: 'offline', lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    lastMessage: 'الملابس جاهزة للتسليم',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    unreadCount: 0
  }
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u1', text: 'السلام عليكم ورحمة الله', time: new Date(Date.now() - 1000 * 60 * 60), status: 'read', type: 'text' },
  { id: 'm2', senderId: 'me', text: 'وعليكم السلام، أهلاً بك أخي أحمد', time: new Date(Date.now() - 1000 * 60 * 55), status: 'read', type: 'text' },
  { id: 'm3', senderId: 'u1', text: 'بخصوص التبرع، متى الوقت المناسب للتسليم؟', time: new Date(Date.now() - 1000 * 60 * 10), status: 'read', type: 'text' },
  { id: 'm4', senderId: 'me', text: 'ممكن اليوم بعد العصر إن شاء الله، الساعة 4:30', time: new Date(Date.now() - 1000 * 60 * 8), status: 'read', type: 'text' },
  { id: 'm5', senderId: 'u1', text: 'تمام، هكون موجود في الموعد إن شاء الله', time: new Date(Date.now() - 1000 * 60 * 5), status: 'read', type: 'text' },
];

export function MessagesCenter() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>(MOCK_CONVERSATIONS[0].id);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear timers on unmount to prevent state updates after unmount
  useEffect(() => {
    return () => { timerRefs.current.forEach(clearTimeout); };
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputValue.trim(),
      time: new Date(),
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate delivery and read receipts
    timerRefs.current.push(
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
      }, 1000),
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m));
      }, 3000)
    );
  };

  const filteredConversations = conversations.filter(c => 
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[85vh] bg-white dark:bg-[#1A2332] rounded-3xl border shadow-xl overflow-hidden" dir="rtl">
      
      {/* ── Sidebar: Conversations List ── */}
      <div className="w-80 md:w-96 border-l flex flex-col bg-muted/20">
        {/* Header */}
        <div className="p-4 border-b bg-white dark:bg-[#1A2332] flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            الرسائل
            <Badge className="bg-primary">{conversations.reduce((acc, c) => acc + c.unreadCount, 0)}</Badge>
          </h2>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث في المحادثات..." 
              className="pr-9 bg-white dark:bg-black/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  // mark as read
                  setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right ${
                  activeConvId === conv.id 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'hover:bg-accent border-transparent'
                } border`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border shadow-sm">
                    <AvatarImage src={conv.user.avatar} />
                    <AvatarFallback className="bg-primary/5 text-primary"><UserCircle className="h-6 w-6" /></AvatarFallback>
                  </Avatar>
                  <OnlinePresenceIndicator status={conv.user.status} className="absolute bottom-0 right-0 border-2 border-white dark:border-[#1A2332]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm truncate">{conv.user.name}</h3>
                    <span className={`text-xs ${conv.unreadCount > 0 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {formatDistanceToNow(conv.lastMessageTime, { locale: arSA })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {conv.isTyping ? <span className="text-primary text-xs italic animate-pulse">يكتب الآن...</span> : conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary shrink-0">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-[#0F1623]/50">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b bg-white dark:bg-[#1A2332] flex items-center justify-between shadow-sm z-10">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-xl transition-colors"
                onClick={() => setProfileModalOpen(true)}
              >
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={activeConv.user.avatar} />
                  <AvatarFallback className="bg-primary/5 text-primary"><UserCircle className="h-6 w-6" /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-base">{activeConv.user.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <OnlinePresenceIndicator status={activeConv.isTyping ? 'isTyping' : activeConv.user.status} size="sm" />
                    {activeConv.isTyping ? 'يكتب...' : 
                     activeConv.user.status === 'online' ? 'متصل الآن' : 
                     `آخر ظهور ${activeConv.user.lastSeen ? formatDistanceToNow(activeConv.user.lastSeen, { addSuffix: true, locale: arSA }) : ''}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10"><Phone className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10"><Video className="h-5 w-5" /></Button>
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" size="icon" className="text-muted-foreground"><Info className="h-5 w-5" /></Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {/* Date Divider */}
                <div className="flex justify-center">
                  <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full border shadow-sm">
                    اليوم
                  </span>
                </div>

                {messages.map((msg) => {
                  const isMe = msg.senderId === 'me';
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMe && (
                          <Avatar className="h-8 w-8 mt-auto shrink-0">
                            <AvatarImage src={activeConv.user.avatar} />
                            <AvatarFallback><UserCircle className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                          isMe 
                            ? 'bg-primary text-white rounded-br-sm' 
                            : 'bg-white dark:bg-[#1A2332] border rounded-bl-sm text-foreground'
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            <span>{msg.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              msg.status === 'read' ? <CheckCheck className="h-3 w-3 text-blue-300" /> :
                              msg.status === 'delivered' ? <CheckCheck className="h-3 w-3" /> :
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {activeConv.isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-[#1A2332] border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-[#1A2332] border-t">
              <div className="flex items-end gap-2 bg-muted/30 p-2 rounded-2xl border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary rounded-xl h-10 w-10">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary rounded-xl h-10 w-10">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <textarea 
                  placeholder="اكتب رسالة..." 
                  className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[40px] max-h-[120px] py-2 text-sm"
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                {inputValue.trim() ? (
                  <Button 
                    size="icon" 
                    className="shrink-0 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 w-10 shadow-md transition-transform active:scale-95"
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4 ms-1" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`shrink-0 rounded-xl h-10 w-10 ${isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-semibold">اختر محادثة للبدء</p>
          </div>
        )}
      </div>

      {activeConv && (
        <BeneficiaryProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={{
            id: activeConv.user.id,
            name: activeConv.user.name,
            avatar: activeConv.user.avatar,
            role: 'user'
          }}
        />
      )}
    </div>
  );
}
