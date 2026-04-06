import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  senderName: string;
  text: string;
  time: string;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  recipientAvatar: string;
  currentUser?: { name: string; avatar?: string };
}

export function ChatDialog({ open, onOpenChange, recipientName, recipientAvatar, currentUser }: ChatDialogProps) {
  const currentUserName = currentUser?.name || 'زائر';
  
  // Create a symmetric key so both users see the same chat
  const chatParticipants = [currentUserName, recipientName].sort();
  const CHAT_KEY = `chat_history_${chatParticipants[0]}_${chatParticipants[1]}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(CHAT_KEY);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        senderName: recipientName,
        text: 'مرحباً! شكراً لاهتمامك بالتبرع',
        time: '10:30 ص',
      },
      {
        id: '2',
        senderName: currentUserName,
        text: 'أهلاً، متى يمكنني استلام التبرع؟',
        time: '10:32 ص',
      },
      {
        id: '3',
        senderName: recipientName,
        text: 'يمكنك الاستلام اليوم بعد الساعة 3 عصراً',
        time: '10:35 ص',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, recipientName]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderName: currentUserName,
        text: newMessage,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={recipientAvatar} alt={recipientName} />
              <AvatarFallback>{recipientName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{recipientName}</DialogTitle>
              <DialogDescription>نشط الآن</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-4 py-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.senderName === currentUserName ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.senderName === currentUserName
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderName === currentUserName ? 'text-white/70' : 'text-muted-foreground'
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder="اكتب رسالتك..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
