const { GoogleGenAI } = require('@google/genai');

let aiClient = null;
function getClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

const GOAL_HE = { loss: 'ירידה במשקל', gain: 'עלייה במסה', health: 'חיים בריאים' };
const GOAL_EN = { loss: 'weight loss', gain: 'muscle gain', health: 'healthy living' };

function mealLine(meal, labels) {
  if (!meal || !meal.name) return labels.noMeal;
  const cal   = meal.calories ?? '?';
  const prot  = meal.protein  ?? '?';
  const carbs = meal.carbs    ?? '?';
  const fat   = meal.fat      ?? '?';
  return `${meal.name} — ${cal} ${labels.cal} | ${labels.protein}: ${prot}g | ${labels.carbs}: ${carbs}g | ${labels.fat}: ${fat}g`;
}

function buildSystemPrompt(profile, menu, lang) {
  const isHe = lang !== 'en';

  if (isHe) {
    const labels = { cal: 'קל׳', protein: 'חלבון', carbs: 'פחמימות', fat: 'שומן', noMeal: 'לא נמצא מתכון מתאים' };
    const totalCal = (menu.breakfast?.calories || 0) + (menu.lunch?.calories || 0) + (menu.dinner?.calories || 0);
    return `אתה עוזר תזונה אישי חכם. תפקידך לעזור למשתמש להבין את התפריט היומי שנבנה עבורו, לספק הסברים תזונתיים, להציע חלופות ולענות על שאלות בנושא תזונה.

חשוב: יש לך גישה מלאה לכל פרטי הפרופיל ולתפריט של המשתמש כפי שמפורט להלן. אל תבקש מידע נוסף — המידע הזה הוא כל מה שאתה צריך.

פרטי המשתמש:
• גיל: ${profile.age} שנים
• משקל: ${profile.weight} ק"ג
• גובה: ${profile.height} ס"מ
• מטרה: ${GOAL_HE[profile.goal] || profile.goal}
• יעד קלורי יומי: ${profile.calories} קלוריות
${profile.vegetarianOnly ? '• תזונה: צמחוני בלבד' : ''}
${profile.allergies?.length ? `• אלרגיות: ${profile.allergies.join(', ')}` : ''}

התפריט היומי שנבחר עבור המשתמש:
🌅 ארוחת בוקר: ${mealLine(menu.breakfast, labels)}
☀️ ארוחת צהריים: ${mealLine(menu.lunch, labels)}
🌙 ארוחת ערב: ${mealLine(menu.dinner, labels)}
סה"כ קלוריות בתפריט: ${totalCal} קל׳

הנחיות:
• ענה תמיד בעברית בצורה ידידותית, חמה ומעודדת
• הסבר בצורה ברורה ומעניינת, בלי ז׳רגון מורכב
• כשמציע חלופות — הצע ספציפית ונמק מדוע
• כשנשאל על טיפים — התאם אישית לפרופיל המשתמש
• ענה בצורה מפורטת ורלוונטית`;
  }

  const labels = { cal: 'cal', protein: 'protein', carbs: 'carbs', fat: 'fat', noMeal: 'No suitable recipe found' };
  const totalCal = (menu.breakfast?.calories || 0) + (menu.lunch?.calories || 0) + (menu.dinner?.calories || 0);
  return `You are a smart personal nutrition assistant. Your role is to help the user understand their personalized daily menu, provide nutritional explanations, suggest alternatives, and answer nutrition questions.

Important: You have full access to the user's profile and menu details listed below. Do not ask for additional information — this is everything you need.

User Profile:
• Age: ${profile.age} years
• Weight: ${profile.weight} kg
• Height: ${profile.height} cm
• Goal: ${GOAL_EN[profile.goal] || profile.goal}
• Daily Calorie Target: ${profile.calories} calories
${profile.vegetarianOnly ? '• Diet: Vegetarian only' : ''}
${profile.allergies?.length ? `• Allergies: ${profile.allergies.join(', ')}` : ''}

Daily Menu Selected for This User:
🌅 Breakfast: ${mealLine(menu.breakfast, labels)}
☀️ Lunch: ${mealLine(menu.lunch, labels)}
🌙 Dinner: ${mealLine(menu.dinner, labels)}
Total menu calories: ${totalCal} cal

Guidelines:
• Always respond in a friendly, warm, and encouraging tone
• Explain clearly and engagingly, without complex jargon
• When suggesting alternatives — be specific and explain why
• When asked for tips — personalize them to the user's profile
• Give detailed and relevant answers`;
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

  if (!process.env.GEMINI_API_KEY) {
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
    const systemPrompt = buildSystemPrompt(profile, menu, lang || 'he');

    // Convert from Claude format ({ role, content }) to Gemini format ({ role, parts })
    // Gemini uses 'model' instead of 'assistant' for AI turns
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const stream = await getClient().models.generateContentStream({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      contents,
      config: { maxOutputTokens: 2048 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ success: true, data: { text }, error: null })}\n\n`);
        // Force the chunk out of Node's internal buffer immediately
        if (res.flush && typeof res.flush === 'function') {
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
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: err.message, details: {} },
      });
    } else if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ success: false, data: null, error: { code: 'STREAM_ERROR', message: err.message, details: {} } })}\n\n`);
      res.end();
    }
  }
}

module.exports = { chat };
