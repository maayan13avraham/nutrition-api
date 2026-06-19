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
  if (!meal) return labels.noMeal;
  return `${meal.name} — ${meal.calories} ${labels.cal}, ${labels.protein}: ${meal.protein}g, ${labels.carbs}: ${meal.carbs}g, ${labels.fat}: ${meal.fat}g`;
}

function buildSystemPrompt(profile, menu, lang) {
  const isHe = lang !== 'en';

  if (isHe) {
    const labels = { cal: 'קל׳', protein: 'חלבון', carbs: 'פחמימות', fat: 'שומן', noMeal: 'לא נמצא מתכון מתאים' };
    return `אתה עוזר תזונה אישי חכם. תפקידך לעזור למשתמש להבין את התפריט היומי שנבנה עבורו, לספק הסברים תזונתיים, להציע חלופות ולענות על שאלות בנושא תזונה.

פרטי המשתמש:
• גיל: ${profile.age} שנים
• משקל: ${profile.weight} ק"ג
• גובה: ${profile.height} ס"מ
• מטרה: ${GOAL_HE[profile.goal] || profile.goal}
• יעד קלורי יומי: ${profile.calories} קלוריות
${profile.vegetarianOnly ? '• תזונה: צמחוני בלבד' : ''}
${profile.allergies?.length ? `• אלרגיות: ${profile.allergies.join(', ')}` : ''}

התפריט היומי המוצע:
🌅 ארוחת בוקר: ${mealLine(menu.breakfast, labels)}
☀️ ארוחת צהריים: ${mealLine(menu.lunch, labels)}
🌙 ארוחת ערב: ${mealLine(menu.dinner, labels)}

סה"כ קלוריות בתפריט: ${(menu.breakfast?.calories || 0) + (menu.lunch?.calories || 0) + (menu.dinner?.calories || 0)} קל׳

הנחיות:
• ענה תמיד בעברית בצורה ידידותית, חמה ומעודדת
• הסבר בצורה ברורה ומעניינת, בלי ז׳רגון מורכב
• כשמציע חלופות — הצע ספציפית ונמק מדוע
• כשנשאל על טיפים — התאם אישית לפרופיל המשתמש
• שמור על תשובות קצרות ורלוונטיות`;
  }

  const labels = { cal: 'cal', protein: 'protein', carbs: 'carbs', fat: 'fat', noMeal: 'No suitable recipe found' };
  return `You are a smart personal nutrition assistant. Your role is to help the user understand their personalized daily menu, provide nutritional explanations, suggest alternatives, and answer nutrition questions.

User Profile:
• Age: ${profile.age} years
• Weight: ${profile.weight} kg
• Height: ${profile.height} cm
• Goal: ${GOAL_EN[profile.goal] || profile.goal}
• Daily Calorie Target: ${profile.calories} calories
${profile.vegetarianOnly ? '• Diet: Vegetarian only' : ''}
${profile.allergies?.length ? `• Allergies: ${profile.allergies.join(', ')}` : ''}

Proposed Daily Menu:
🌅 Breakfast: ${mealLine(menu.breakfast, labels)}
☀️ Lunch: ${mealLine(menu.lunch, labels)}
🌙 Dinner: ${mealLine(menu.dinner, labels)}

Total menu calories: ${(menu.breakfast?.calories || 0) + (menu.lunch?.calories || 0) + (menu.dinner?.calories || 0)} cal

Guidelines:
• Always respond in English in a friendly, warm, and encouraging tone
• Explain clearly and engagingly, without complex jargon
• When suggesting alternatives — be specific and explain why
• When asked for tips — personalize them to the user's profile
• Keep responses concise and relevant`;
}

async function chat(req, res) {
  const { profile, menu, messages, lang } = req.body;

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
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

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
      config: { maxOutputTokens: 1024 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
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
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
}

module.exports = { chat };
