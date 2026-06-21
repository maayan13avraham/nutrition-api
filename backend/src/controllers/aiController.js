const Groq = require('groq-sdk');

let groqClient = null;
function getClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

const GOAL_LABELS = { loss: 'ירידה במשקל', gain: 'עלייה במסה', health: 'חיים בריאים' };

function formatMeal(meal) {
  if (!meal || !meal.name) return 'לא נמצאה מנה מתאימה';
  return `${meal.name} — ${meal.calories ?? '?'} קל | חלבון: ${meal.protein ?? '?'}g | פחמימות: ${meal.carbs ?? '?'}g | שומן: ${meal.fat ?? '?'}g`;
}

function buildSystemPrompt(profile, menu) {
  const goal = GOAL_LABELS[profile.goal] || profile.goal || '';
  const totalCal = (Number(menu.breakfast?.calories) || 0)
                 + (Number(menu.lunch?.calories)     || 0)
                 + (Number(menu.dinner?.calories)    || 0);

  const dietaryLines = [];
  if (profile.vegetarianOnly) dietaryLines.push('תזונה: צמחוני בלבד');
  if (profile.allergies?.length) dietaryLines.push(`אלרגיות: ${profile.allergies.join(', ')}`);

  return `אתה "נוטרי" — מאמן תזונה וכושר מקצועי, חכם, חברותי ואנושי. אתה משוחח בעברית טבעית ובגובה העיניים.

[הקשר פנימי — אל תציג מידע זה למשתמש אלא אם נשאל עליו]
פרופיל: גיל ${profile.age}, משקל ${profile.weight} ק"ג, גובה ${profile.height} ס"מ, מטרה: ${goal}, יעד קלורי: ${profile.calories} קל/יום. ${dietaryLines.join(', ')}
תפריט היום: בוקר — ${formatMeal(menu.breakfast)}. צהריים — ${formatMeal(menu.lunch)}. ערב — ${formatMeal(menu.dinner)}. סה"כ ${totalCal} קלוריות.
[סוף הקשר פנימי]

כללים:
- ענה תמיד בעברית תקינה, קצרה וישירה.
- יש לך חופש שיחה מלא. אם המשתמש אומר "היי" או שואל שאלה כללית — ענה בצורה טבעית כמו חבר. אל תדחוף בחזרה לנתוני התפריט אלא אם המשתמש מבקש.
- כשנשאל על התפריט — השתמש בנתונים שמעלה, תן עצה מעשית וספציפית.
- אל תתחיל תשובות עם "בוודאי!", "שאלה מצוינת!" או ניסוחים גנריים דומים.`;
}

async function chat(req, res) {
  const { profile, menu, messages, lang } = req.body;

  console.log('[AI chat] received menu:', JSON.stringify({
    breakfast: menu?.breakfast ? `${menu.breakfast.name} (${menu.breakfast.calories} cal)` : null,
    lunch:     menu?.lunch     ? `${menu.lunch.name} (${menu.lunch.calories} cal)`     : null,
    dinner:    menu?.dinner    ? `${menu.dinner.name} (${menu.dinner.calories} cal)`    : null,
  }));

  if (!profile || !menu || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'profile, menu, and messages are required', details: {} },
    });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      success: false,
      data: null,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'AI service is not configured', details: {} },
    });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const systemPrompt = buildSystemPrompt(profile, menu);

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const stream = await getClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      stream: true,
      max_tokens: 2048,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ success: true, data: { text }, error: null })}\n\n`);
        if (typeof res.flush === 'function') {
          res.flush();
        } else if (typeof res.flushHeaders === 'function') {
          res.flushHeaders();
        }
      }
    }

    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ success: true, data: { done: true }, error: null })}\n\n`);
      res.end();
    }
  } catch (err) {
    const isRateLimit = err.status === 429;
    const errCode = isRateLimit ? 'RATE_LIMIT_EXCEEDED' : 'INTERNAL_ERROR';
    const errMsg  = isRateLimit
      ? 'AI rate limit reached. Please wait a moment and try again.'
      : err.message;
    console.error('[AI chat] GROQ ERROR:', isRateLimit ? '429 rate limit' : err.message);
    if (!res.headersSent) {
      res.status(isRateLimit ? 429 : 500).json({
        success: false,
        data: null,
        error: { code: errCode, message: errMsg, details: {} },
      });
    } else if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ success: false, data: null, error: { code: errCode, message: errMsg, details: {} } })}\n\n`);
      res.end();
    }
  }
}

module.exports = { chat };
