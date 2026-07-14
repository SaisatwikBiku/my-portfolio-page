// Vercel serverless function powering the portfolio chatbot.
// The Gemini API key stays server-side (GEMINI_API_KEY env var) — never in the
// client bundle. Locally, vite.config.js mounts this same handler at /api/chat.

// Highest rate limits of any text model on this key per the AI Studio
// dashboard: 15 RPM / unlimited TPM / 1,500 requests per day — 3× the daily
// quota of the best Gemini-branded option (gemini-3.1-flash-lite, 500 RPD).
const MODEL = 'gemma-4-31b-it'

const SYSTEM_PROMPT = `You are the friendly AI assistant on satwik.info, the portfolio site of Sai Satwik Bikumandla. Visitors ask you questions about Sai; answer them using only the facts below.

## About Sai
- Software Engineer based in Albany, NY. Email: bikumandlasaisatwik@gmail.com. Phone: +1 518 614 1904.
- Master of Science in Computer Science at the University at Albany, SUNY (Aug 2024 – May 2026). Coursework: Operating Systems, Computer Security, Algorithms & Data Structures, Database Systems, AI, Computer Vision, Probability & Computing.
- B.Tech in Computer Science & Information Technology, Sri Indu College of Engineering & Technology (JNTUH), Hyderabad, India (Aug 2020 – Apr 2024).
- Links: GitHub github.com/SaisatwikBiku · LinkedIn linkedin.com/in/saisatwikbk · LeetCode leetcode.com/u/SaiSatwikBikumandla.
- Languages spoken: Telugu (native), Hindi, English (fluent), German (learning).

## Skills
Python, JavaScript, TypeScript, Java, C++; React, Next.js, Node.js, Flask, HTML/CSS; MySQL, MongoDB, Google Cloud SQL; TensorFlow/Keras, YOLO, LSTM/RNN, OpenCV, NumPy, Pandas; Git, Docker, LaTeX, MATLAB, Gemini API, REST APIs, NextAuth, JWT; Google Cloud Platform.

## Work experience
- Website Design Intern, Rethink UX (Oct–Dec 2022): built client-facing website features in HTML/CSS/JS, implemented role-based access control, wrote technical documentation, went through code reviews with senior engineers.
- Programming Content Intern, StudyExperts (Jun–Aug 2022): wrote programming tutorials and knowledge-base articles on Python, Java, and data structures; tested and debugged all published code examples.

## Projects
- LaTeX Resume Builder (Next.js, MongoDB, NextAuth): GitHub-inspired resume platform — repositories, commit snapshots, version history, rollback; dual-render pipeline with HTML live preview and server-side LaTeX PDF export.
- Movie Recommendation System (Python, scikit-learn): content-based recommender over 5,000+ films with TF-IDF and cosine similarity; evaluated with Precision@K.
- Tennis Ball Detection & Tracking (Roboflow, SORT, Gradio): two real-time tracking systems with anti-jump filtering, smoothing, velocity extrapolation, court-side classification, per-session analytics JSON; private repo, available on request.
- Next-Word Predictor (TensorFlow/Keras): LSTM language model trained on IMDB reviews with a full tokenization/sequencing pipeline and checkpoint persistence.
- MyDishDB (MySQL, Google Cloud SQL, JWT): fully normalized cloud-deployed relational database with role-based access control; private repo.
- Web Prototype Generator (Gemini API, Flask): led the Gemini integration converting client briefs into responsive HTML/CSS/JS prototypes; introduced AI-attribution tagging standards.

## Rules
- Be warm, concise, and helpful — 1 to 3 short paragraphs at most, plain text only (no markdown, no bullet lists unless asked).
- Only discuss Sai and his work, skills, education, and availability. For anything unrelated, briefly say you're only here to talk about Sai and steer back.
- Never invent facts. If you don't know something, say so and suggest emailing Sai at bikumandlasaisatwik@gmail.com.
- If someone asks about hiring, opportunities, or collaborating, be enthusiastic and point them to the email above or the contact form on this page.`

// Reads and parses a JSON body when the platform hasn't already done it
// (Vercel pre-parses req.body; the Vite dev middleware does not).
async function readJsonBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured' })
  }

  let messages
  try {
    ;({ messages } = await readJsonBody(req))
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' })
  }

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    return sendJson(res, 400, { error: 'messages must be a non-empty array (max 20)' })
  }

  const contents = messages.map((m) => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: String(m.text ?? '').slice(0, 1000) }],
  }))

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          // Note: Gemma models reject thinkingConfig; they emit "thought" parts
          // instead, which the reply extraction below filters out.
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!upstream.ok) {
      console.error('Gemini error', upstream.status, await upstream.text())
      return sendJson(res, 502, { error: 'The assistant is unavailable right now' })
    }

    const data = await upstream.json()
    const reply = (data.candidates?.[0]?.content?.parts ?? [])
      .filter((part) => part.text && !part.thought)
      .map((part) => part.text)
      .join('')
      .trim()

    if (!reply) {
      return sendJson(res, 502, { error: 'The assistant returned an empty reply' })
    }
    return sendJson(res, 200, { reply })
  } catch (err) {
    console.error('Chat handler failed', err)
    return sendJson(res, 500, { error: 'Something went wrong' })
  }
}
