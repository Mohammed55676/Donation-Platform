const Campaign = require('../models/Campaign.model');
const Donation = require('../models/Donation.model');
const VolunteerOpportunity = require('../models/VolunteerOpportunity.model');

async function getLiveStatsPrompt() {
  try {
    const activeCampaigns = await Campaign.find({ status: 'active' }).limit(5);
    const activeVolunteers = await VolunteerOpportunity.find({ isActive: true }).limit(5);
    const availableDonationsCount = await Donation.countDocuments({ status: 'متاح' });

    let statsText = '\n\nالمعلومات المباشرة الحالية من قاعدة بيانات المنصة:\n';
    statsText += `- عدد التبرعات العينية المتاحة حالياً للمستفيدين: ${availableDonationsCount} تبرع عيني.\n`;

    if (activeCampaigns.length > 0) {
      statsText += `- الحملات النشطة المتاحة للتبرع المالي:\n`;
      activeCampaigns.forEach(c => {
        const progress = c.target > 0 ? Math.round((c.current / c.target) * 100) : 0;
        statsText += `  * حملة "${c.title}": الهدف ${c.target}$، المحصل حتى الآن ${c.current}$ (${progress}%)، مستوى الأهمية: ${c.urgency}.\n`;
      });
    }

    if (activeVolunteers.length > 0) {
      statsText += `- فرص التطوع المتاحة للتقديم:\n`;
      activeVolunteers.forEach(v => {
        const spotsLeft = Math.max(0, v.maxVolunteers - v.volunteers);
        statsText += `  * فرصة "${v.title}" في "${v.location}"، المقاعد المتبقية: ${spotsLeft}.\n`;
      });
    }

    return statsText;
  } catch (error) {
    console.error('Error constructing live stats for AI:', error);
    return '';
  }
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

// ── Claude (Anthropic) proxy ──────────────────────────────────
exports.chatWithClaude = async (req, res) => {
  try {
    const { messages, systemPrompt, userMessage } = req.body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_claude_key_here') {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

    let inputMessages = Array.isArray(messages) ? messages : [];
    let formattedMessages = inputMessages.map(msg => {
      let role = msg.role === 'model' ? 'assistant' : msg.role;
      let content = '';
      if (typeof msg.content === 'string') content = msg.content;
      else if (msg.parts && Array.isArray(msg.parts)) content = msg.parts.map(p => p.text || '').join('\n');
      else if (msg.text) content = msg.text;
      return { role: role === 'assistant' ? 'assistant' : 'user', content };
    });

    if (userMessage) {
      const lastMsg = formattedMessages[formattedMessages.length - 1];
      if (!lastMsg || lastMsg.content !== userMessage) {
        formattedMessages.push({ role: 'user', content: userMessage });
      }
    }

    formattedMessages = formattedMessages.filter(msg => msg.content && msg.content.trim() !== '');
    if (formattedMessages.length === 0) return res.status(400).json({ error: 'No messages to send' });

    const liveStats = await getLiveStatsPrompt();
    const system = (systemPrompt || DEFAULT_SYSTEM_PROMPT) + liveStats;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system,
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Anthropic API error: ${errorText}` });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || JSON.stringify(data);
    return res.json({ reply, provider: 'Claude' });
  } catch (error) {
    console.error('Error in chatWithClaude:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── Gemini proxy (server-side, avoids browser CORS) ───────────
exports.chatWithGemini = async (req, res) => {
  try {
    const { messages, systemPrompt, userMessage } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_key_here') {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Build contents array for Gemini
    let contents = Array.isArray(messages)
      ? messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content || '' }],
        })).filter(m => m.parts[0].text.trim() !== '')
      : [];

    // Append current user message
    if (userMessage && userMessage.trim()) {
      const last = contents[contents.length - 1];
      if (!last || last.parts[0].text !== userMessage) {
        contents.push({ role: 'user', parts: [{ text: userMessage }] });
      }
    }

    if (contents.length === 0) return res.status(400).json({ error: 'No messages to send' });

    const liveStats = await getLiveStatsPrompt();
    const system = (systemPrompt || DEFAULT_SYSTEM_PROMPT) + liveStats;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: system }] },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return res.status(500).json({ error: 'Gemini returned empty response' });

    return res.json({ reply, provider: 'Gemini' });
  } catch (error) {
    console.error('Error in chatWithGemini:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
