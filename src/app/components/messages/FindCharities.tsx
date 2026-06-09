import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import api from '../../utils/api';

interface Charity {
  id: string;
  _id?: string;
  name: string;
  avatar?: string;
  location?: string;
  charityBadge?: boolean;
}

export function FindCharities() {
  const navigate = useNavigate();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [messageText, setMessageText] = useState('مرحباً، أود التواصل معكم بخصوص تبرع.');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await api.get('/users/contactable-charities');
        setCharities(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch charities', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharities();
  }, []);

  const filtered = charities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async () => {
    if (!selectedCharity || !messageText.trim()) return;
    
    setSending(true);
    const receiverId = selectedCharity.id || selectedCharity._id;
    
    try {
      const res = await api.post('/conversations/request', {
        receiver_id: receiverId,
        message: messageText.trim()
      });
      
      toast.success('تم فتح المحادثة.');
      setSelectedCharity(null);
      
      const convId = res.data.data._id || res.data.data.id;
      navigate(`/messages/${convId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ أثناء فتح المحادثة.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">البحث عن جمعيات</h2>
          <p className="text-sm text-muted-foreground mt-1">
            تواصل مباشرة مع الجمعيات الموثقة لدينا.
          </p>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="ابحث باسم الجمعية..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pr-9 h-11 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-2xl bg-muted/20">
          لا توجد جمعيات تطابق بحثك.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(charity => (
            <Card key={charity.id || charity._id} className="overflow-hidden hover:shadow-md transition-all border-border/60 group">
              <CardContent className="p-4 flex gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/10 rounded-xl">
                  <AvatarImage src={charity.avatar} />
                  <AvatarFallback className="rounded-xl bg-primary/5 text-primary font-bold text-lg">
                    {charity.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate flex items-center gap-1.5">
                    {charity.name}
                    {charity.charityBadge !== false && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-50" />
                    )}
                  </h3>
                  
                  <div className="flex items-center text-xs text-muted-foreground mt-1 mb-3">
                    <MapPin className="h-3.5 w-3.5 me-1" />
                    {charity.location || 'الموقع غير متوفر'}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    جمعية خيرية موثقة في المنصة.
                  </p>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full rounded-lg bg-primary/90 hover:bg-primary shadow-none"
                    onClick={() => setSelectedCharity(charity)}
                  >
                    <MessageSquare className="h-4 w-4 me-2" />
                    بدء محادثة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Start Chat Modal */}
      <Dialog open={!!selectedCharity} onOpenChange={(open) => !open && setSelectedCharity(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>مراسلة {selectedCharity?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">
              اكتب رسالتك الأولى للجمعية. سيتم فتح محادثة مباشرة معهم.
            </p>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="resize-none h-24"
              placeholder="اكتب رسالتك هنا..."
            />
          </div>
          
          <DialogFooter className="flex-row sm:justify-start gap-2">
            <Button onClick={handleStartChat} disabled={!messageText.trim() || sending}>
              {sending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              إرسال
            </Button>
            <Button variant="outline" onClick={() => setSelectedCharity(null)} disabled={sending}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
