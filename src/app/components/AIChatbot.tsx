import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  provider?: 'Claude' | 'Gemini' | 'محلي';
  error?: boolean;
}

const DEFAULT_SYSTEM_PROMPT = `أنت مساعد ذكي لمنصة الخير — منصة تبرعات اجتماعية عربية.
تحدث بشكل طبيعي ومريح مثل شخص حقيقي وليس روبوت.
ساعد المستخدمين في كل ما يتعلق بالمنصة.
لو عند المستخدم مشكلة، اقترح حلاً عملياً خطوة بخطوة.
أجب بالعربية دائماً إلا لو تحدث المستخدم بالإنجليزية.
لا تخترع معلومات غير موجودة في المنصة.

معلومات المنصة:
- التبرعات: إضافة تبرعات عينية، تُراجع خلال 24-48 ساعة
- طلب المساعدة: طلب تبرع معروض أو نشر في المجتمع
- التطوع: فرص تطوعية، الساعات تُحتسب في الملف الشخصي
- الحملات: مبادرات جماعية لهدف محدد
- المؤسسات: جمعيات خيرية يمكن دعمها مالياً
- المحادثات: تواصل مباشر بين المتبرع والمستفيد
- التوثيق: رفع هوية للحصول على شارة موثق
- الخريطة: أماكن التبرع التفاعلية
- لوحة التحكم: متابعة التبرعات والطلبات والملف الشخصي
- الصفحات: /donations /volunteer /community /organizations /locations /dashboard /about /contact`;

export function AIChatbot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: language === 'ar' 
            ? 'مرحباً بك في منصة الخير! كيف يمكنني مساعدتك اليوم؟' 
            : 'Welcome to Al-Khair Platform! How can I help you today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'محلي'
        }
      ]);
    }
  }, [language, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fallback answers database
  const getLocalFallbackAnswer = (text: string, isEnglish: boolean): string => {
    const query = text.toLowerCase().trim();
    if (isEnglish) {
      if (query.includes('donate') || query.includes('how to donate') || query.includes('donation')) {
        return 'You can donate by going to the Donations page (/donations) and clicking "Add physical donation". Our team will review it within 24-48 hours.';
      }
      if (query.includes('help') || query.includes('need') || query.includes('request')) {
        return 'You can request help by browsing active donations or creating a post in the Community page (/community) to describe your needs.';
      }
      if (query.includes('volunteer') || query.includes('opportunity')) {
        return 'Visit the Volunteer page (/volunteer) to find opportunities matching your skills. Completed hours are recorded in your profile.';
      }
      if (query.includes('track') || query.includes('my donations') || query.includes('dashboard')) {
        return 'You can track all your donations and requests from your personal Dashboard (/dashboard).';
      }
      if (query.includes('verify') || query.includes('badge') || query.includes('id') || query.includes('account')) {
        return 'To verify your account and get a verification badge, upload your ID copy in the Profile settings page.';
      }
      if (query.includes('login') || query.includes('signin') || query.includes('technical issue') || query.includes('problem')) {
        return 'If you face any issues logging in or technical problems, go to the Contact Us page (/contact) to message support.';
      }
      if (query.includes('contact') || query.includes('chat') || query.includes('message') || query.includes('donor')) {
        return 'You can chat directly with donors or beneficiaries by clicking the "Contact" button on their listing or page.';
      }
      if (query.includes('where') || query.includes('map') || query.includes('location')) {
        return 'Use the interactive map on the Locations page (/locations) to find the nearest drop-off point or organization.';
      }
      return "I'm sorry, I couldn't understand your question. Try one of the quick actions or contact our support team at /contact.";
    } else {
      if (query.includes('تبرع') || query.includes('كيف اتبرع') || query.includes('تبرعوا') || query.includes('تبرعات')) {
        return 'يمكنك التبرع عن طريق الانتقال إلى صفحة التبرعات العينية /donations، ثم الضغط على زر "إضافة تبرع عيني". سيتم مراجعة تبرعك من قبل فريق المنصة خلال 24-48 ساعة.';
      }
      if (query.includes('مساعدة') || query.includes('احتاج') || query.includes('أحتاج') || query.includes('طلب')) {
        return 'يمكنك طلب المساعدة من خلال تصفح التبرعات المعروضة أو نشر طلب تبرع أو كتابة منشور في صفحة المجتمع /community لشرح احتياجاتك.';
      }
      if (query.includes('تطوع') || query.includes('فرص')) {
        return 'تفضل بزيارة صفحة التطوع /volunteer حيث ستجد فرصاً تطوعية مختلفة تناسب مهاراتك. الساعات التطوعية التي تقضيها تُسجّل وتُحتسب مباشرة في ملفك الشخصي.';
      }
      if (query.includes('متابعة') || query.includes('تبرعاتي') || query.includes('أين تبرعاتي')) {
        return 'يمكنك متابعة التبرعات التي قدمتها والطلبات التي أرسلتها عبر لوحة التحكم الخاصة بك /dashboard.';
      }
      if (query.includes('توثيق') || query.includes('شارة') || query.includes('الهوية') || query.includes('الحساب')) {
        return 'لتوثيق حسابك والحصول على شارة موثق، يرجى الانتقال إلى الإعدادات في لوحة التحكم ورفع صورة الهوية الشخصية لإثبات الهوية والتحقق منها.';
      }
      if (query.includes('تسجيل') || query.includes('دخول') || query.includes('مشكلة تقنية') || query.includes('تقنية') || query.includes('الدخول') || query.includes('مشكله')) {
        return 'إذا واجهت أي مشكلة تقنية أو صعوبة في تسجيل الدخول، يرجى الانتقال إلى صفحة اتصل بنا /contact أو إرسال تفاصيل المشكلة وسيقوم فريق الدعم بمساعدتك فوراً.';
      }
      if (query.includes('تواصل') || query.includes('اتصل') || query.includes('رسالة') || query.includes('محادثة') || query.includes('شات')) {
        return 'يمكنك التواصل مباشرة مع المتبرع أو المستفيد عن طريق الضغط على زر "تواصل" أو "إرسال رسالة" لبدء محادثة خاصة ومباشرة عبر نظام الرسائل الخاص بالمنصة.';
      }
      if (query.includes('أين') || query.includes('خريطة') || query.includes('مكان') || query.includes('أماكن') || query.includes('موقع')) {
        return 'يمكنك استخدام الخريطة التفاعلية في صفحة /locations للبحث عن أقرب موقع أو جمعية خيرية لتسليم التبرعات العينية.';
      }
      return 'عذراً، لم أفهم سؤالك تماماً. يمكنك تجربة اختيار أحد الخيارات السريعة أو التوجه لصفحة اتصل بنا /contact لمساعدتك بشكل أفضل.';
    }
  };

  // 1. Call Claude Backend Proxy
  const callClaude = async (userMessage: string, history: ChatMessage[]): Promise<string> => {
    const apiBase = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
    
    // Normalize format
    const messagesPayload = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch(`${apiBase}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
      },
      body: JSON.stringify({
        messages: messagesPayload,
        userMessage,
        systemPrompt: DEFAULT_SYSTEM_PROMPT
      })
    });

    if (!response.ok) {
      throw new Error(`Claude proxy failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.reply) {
      throw new Error('Claude proxy empty response');
    }
    return data.reply;
  };

  // 2. Call Gemini via Backend Proxy (avoids CORS)
  const callGemini = async (userMessage: string, history: ChatMessage[]): Promise<string> => {
    const apiBase = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

    const messagesPayload = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch(`${apiBase}/ai/chat/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
      },
      body: JSON.stringify({
        messages: messagesPayload,
        userMessage,
        systemPrompt: DEFAULT_SYSTEM_PROMPT
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini proxy failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.reply) {
      throw new Error('Gemini proxy empty response');
    }
    return data.reply;
  };

  // Main message send logic
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const isEnglish = /[a-zA-Z]{3,}/.test(text);

    // Keep history clean of previous failed attempts if any
    const validHistory = messages.filter(m => !m.error);

    try {
      // Step 1: Try Gemini (Backend proxy)
      try {
        const geminiReply = await callGemini(text, validHistory);
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: geminiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'Gemini'
        }]);
        setIsLoading(false);
        return;
      } catch (geminiError) {
        console.warn('Gemini provider failed, falling back to Claude...', geminiError);
      }

      // Step 2: Try Claude (Backend proxy)
      try {
        const claudeReply = await callClaude(text, validHistory);
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: claudeReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'Claude'
        }]);
        setIsLoading(false);
        return;
      } catch (claudeError) {
        console.warn('Claude provider failed, falling back to local KB...', claudeError);
      }

      // Step 3: Local Knowledge Base Fallback
      const fallbackReply = getLocalFallbackAnswer(text, isEnglish);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: fallbackReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'محلي'
      }]);
    } catch (fallbackError) {
      console.error('All chatbot providers failed:', fallbackError);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: isEnglish 
          ? 'An error occurred. Please try again later.' 
          : 'حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const quickActions = language === 'ar' 
    ? ['كيف أتبرع؟', 'أحتاج مساعدة', 'فرص التطوع', 'مشكلة تقنية']
    : ['How to donate?', 'I need help', 'Volunteer opportunities', 'Technical issue'];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans select-none" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-[360px] sm:w-[400px] h-[550px] rounded-3xl bg-background/90 backdrop-blur-xl border border-border/40 shadow-2xl flex flex-col overflow-hidden text-foreground"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">
                    {language === 'ar' ? 'مساعد منصة الخير الذكي' : 'Al-Khair Smart Assistant'}
                  </h3>
                  <p className="text-[10px] text-white/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    {language === 'ar' ? 'نشط الآن' : 'Active Now'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body / Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.role === 'user' ? 'ms-auto flex-row-reverse' : 'me-auto'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div 
                      className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm relative group ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-te-none'
                          : 'bg-background border border-border/40 rounded-ts-none text-foreground'
                      }`}
                    >
                      {msg.content}

                      {/* Provider badge */}
                      {msg.role === 'assistant' && msg.provider && (
                        <span className="absolute -bottom-2.5 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-semibold tracking-wider border bg-background text-muted-foreground border-border shadow-xs opacity-80 select-none">
                          {msg.provider}
                        </span>
                      )}

                      {/* Error badge */}
                      {msg.error && (
                        <span className="flex items-center gap-1 mt-1 text-[10px] text-destructive">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send'}
                        </span>
                      )}
                    </div>
                    <p className={`text-[9px] text-muted-foreground/60 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 max-w-[80%] me-auto items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-background border border-border/40 p-3.5 rounded-2xl rounded-ts-none flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action buttons */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-2 bg-muted/10 border-t border-border/20 flex flex-wrap gap-1.5 justify-center">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-background border border-border/50 hover:border-primary hover:text-primary transition-all duration-250 cursor-pointer shadow-xs active:scale-95"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3 bg-background border-t border-border/30 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
                className="flex-1 bg-muted/40 border border-border/30 rounded-2xl px-4 py-2.5 text-xs text-foreground focus:outline-hidden focus:border-primary focus:bg-background transition-all"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="w-9.5 h-9.5 rounded-xl bg-primary text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer transition-all hover:shadow-xl hover:shadow-primary/30"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
