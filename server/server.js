require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
console.log('🤖 Google AI initialized successfully');

// YouTube Meditation Videos Dataset
const meditationVideos = [
  {
    title: "Daily Calm | 10 Minute Mindfulness Meditation | Be Present",
    url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
    description: "10-minute mindfulness meditation to be present."
  },
  {
    title: "Beginners Meditation for Peace of Mind in Hindi | Inner Peace",
    url: "https://www.youtube.com/watch?v=YWDRFZFCrGE",
    description: "15-minute basic meditation in Hindi for peace of mind."
  },
  {
    title: "Guided Meditation - Blissful Deep Relaxation",
    url: "https://www.youtube.com/watch?v=Jyy0ra2WcQQ",
    description: "A relaxing guided meditation for deep calm."
  },
  {
    title: "Guided Meditation Experience (Hindi): BK Shivani",
    url: "https://www.youtube.com/watch?v=XnT_cOq_Ba8",
    description: "15-minute energising guided meditation by BK Shivani."
  },
  {
    title: "15-Minute Guided Meditation for Stress Relief | Mindfulness",
    url: "https://www.youtube.com/watch?v=2ntenE9Fn5c",
    description: "Meditation for stress relief (15 mins)."
  },
  {
    title: "10 MIN Guided Meditation To Clear Your Mind & Start New",
    url: "https://www.youtube.com/watch?v=uTN29kj7e-w",
    description: "10-minute session to refresh mind."
  },
  {
    title: "7 Minute Guided Meditation for Focus [Hindi]",
    url: "https://www.youtube.com/watch?v=uDuPL6wfWvQ",
    description: "Short Hindi meditation to boost focus."
  },
  {
    title: "Mindfulness Meditation 28 mins | Guided Meditation in Hindi",
    url: "https://www.youtube.com/watch?v=YddV5T6dpNc",
    description: "Long mindfulness session in Hindi for deep relaxation."
  },
  {
    title: "15 Minute Guided Meditation To Find Peace In Uncertain Times",
    url: "https://www.youtube.com/watch?v=W19PdslW7iw",
    description: "Settling the mind in anxiety-full times."
  },
  {
    title: "Guided Meditation for Positive Energy, Relaxation, Peace",
    url: "https://www.youtube.com/watch?v=86m4RC_ADEY",
    description: "Focus on positive energy and relaxation."
  },
  {
    title: "Very Powerful Guided Meditation in Hindi with healing frequency music",
    url: "https://www.youtube.com/watch?v=rb5z7EKFOTc",
    description: "Healing meditation with frequency music (Hindi)."
  },
  {
    title: "20 Minute Guided Meditation For The Heart | Self Love",
    url: "https://www.youtube.com/watch?v=TPC_36ZHOjo",
    description: "Meditation focused on self love and compassion."
  },
  {
    title: "5-Minute Meditation You Can Do Anywhere | Goodful",
    url: "https://www.youtube.com/watch?v=inpok4MKVLM",
    description: "Quick reset - 5 minutes meditation."
  },
  {
    title: "Daily Meditation for Better Focus | Saurabh Bothra Yoga",
    url: "https://www.youtube.com/watch?v=QArcemYQsV0",
    description: "Daily meditation in Hindi for improving focus."
  }
];

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: 'text-embedding-004',
});
console.log('📊 Embeddings model initialized successfully');

const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
console.log('🌲 Pinecone initialized successfully');

// Store conversation history per user
const userHistories = new Map();

// Function to recommend YouTube meditation videos
function recommendMeditationVideos(userQuery, userHistory = []) {
  const query = userQuery.toLowerCase();

  // Keywords for different meditation types
  const stressKeywords = ['stress', 'anxiety', 'worried', 'overwhelmed', 'tension', 'pressure'];
  const focusKeywords = ['focus', 'concentration', 'attention', 'distraction', 'mindfulness'];
  const sleepKeywords = ['sleep', 'insomnia', 'rest', 'relaxation', 'calm'];
  const hindiKeywords = ['hindi', 'indian', 'sanskrit', 'bollywood'];
  const beginnerKeywords = ['beginner', 'new', 'start', 'basic', 'simple'];
  const shortKeywords = ['short', 'quick', '5 min', '10 min', 'brief'];

  let recommendations = [];

  // Filter videos based on user query
  if (stressKeywords.some(keyword => query.includes(keyword))) {
    recommendations = meditationVideos.filter(video =>
      video.description.toLowerCase().includes('stress') ||
      video.title.toLowerCase().includes('stress') ||
      video.description.toLowerCase().includes('anxiety') ||
      video.title.toLowerCase().includes('anxiety')
    );
  } else if (focusKeywords.some(keyword => query.includes(keyword))) {
    recommendations = meditationVideos.filter(video =>
      video.description.toLowerCase().includes('focus') ||
      video.title.toLowerCase().includes('focus') ||
      video.description.toLowerCase().includes('concentration') ||
      video.title.toLowerCase().includes('concentration')
    );
  } else if (sleepKeywords.some(keyword => query.includes(keyword))) {
    recommendations = meditationVideos.filter(video =>
      video.description.toLowerCase().includes('sleep') ||
      video.title.toLowerCase().includes('sleep') ||
      video.description.toLowerCase().includes('relaxation') ||
      video.title.toLowerCase().includes('relaxation')
    );
  } else if (hindiKeywords.some(keyword => query.includes(keyword))) {
    recommendations = meditationVideos.filter(video =>
      video.title.toLowerCase().includes('hindi') ||
      video.description.toLowerCase().includes('hindi')
    );
  } else if (beginnerKeywords.some(keyword => query.includes(keyword))) {
    recommendations = meditationVideos.filter(video =>
      video.title.toLowerCase().includes('beginner') ||
      video.description.toLowerCase().includes('beginner') ||
      video.title.toLowerCase().includes('basic') ||
      video.description.toLowerCase().includes('basic')
    );
  } else if (shortKeywords.some(keyword => query.includes(keyword))) {
    recommendations = meditationVideos.filter(video =>
      video.title.toLowerCase().includes('5 min') ||
      video.title.toLowerCase().includes('7 min') ||
      video.title.toLowerCase().includes('10 min') ||
      video.description.toLowerCase().includes('5 min') ||
      video.description.toLowerCase().includes('7 min') ||
      video.description.toLowerCase().includes('10 min')
    );
  }

  // If no specific matches, return general recommendations
  if (recommendations.length === 0) {
    recommendations = meditationVideos.slice(0, 3); // Return first 3 videos
  }

  // Limit to 2 recommendations
  return recommendations.slice(0, 2);
}

async function transformQuery(userId, question) {
    if (!userHistories.has(userId)) {
        userHistories.set(userId, []);
    }
    const history = userHistories.get(userId);

    history.push({ role: 'user', parts: [{ text: question }] });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: history,
        config: {
            systemInstruction: `
You are a query rewriting expert.
Take the latest user question and rewrite it into a clear, complete, standalone question.
- Make sure it can be understood without any chat history.
- Preserve the original intent and tone.
- Do not include phrases like "follow-up" or "as mentioned before".
- Output ONLY the rewritten question in plain text.
            `,
        },
    });

    history.pop(); // Remove the temp addition
    return response.text;
}

async function answerQuestion(userId, question) {
    if (!userHistories.has(userId)) {
        userHistories.set(userId, []);
    }
    const history = userHistories.get(userId);


    // Regular AI response for non-doctor queries
    const queryVector = await embeddings.embedQuery(question);

    const searchResults = await pineconeIndex.query({
        topK: 10,
        vector: queryVector,
        includeMetadata: true,
    });

    const context = searchResults.matches
        .map(match => match.metadata.text)
        .join("\n\n---\n\n");

    history.push({ role: 'user', parts: [{ text: question }] });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: history,
        config: {
            systemInstruction: `
You are a friendly and empathetic AI assistant specializing in emotional support, wellness guidance, and healthcare navigation.
- Greet the user warmly in your first response.
- Understand the user's feelings and respond with empathy and care.
- Keep your responses VERY SHORT and SIMPLE (1-3 sentences max).
- Use simple, everyday language that anyone can understand.
- Validate the user's emotions with brief, genuine support.
- Everytime use emojis
- If the user expresses distress, anxiety, sadness, or suicidal thoughts, respond with compassion and suggest professional help or helpline resources. For suicidal thoughts, always provide the helpline number: 022-25521111.
- If the user is being demanding, frustrated, or impatient, respond with extra patience and empathy - do NOT suggest videos or resources unless specifically asked.
- Use the context from previous messages to make your answer relevant, but do not give medical advice or diagnosis.
- Always end on a positive or encouraging note.
- Make each response feel personal and caring, but keep it brief.

TRAINING FOUNDATION:
- My responses are informed by principles from "Emotional Intelligence" by Daniel Goleman.
- I draw from Goleman's framework of emotional intelligence competencies including self-awareness, self-regulation, motivation, empathy, and social skills.
- Reference the book naturally when relevant to emotional intelligence discussions, but keep it brief and not forced.
- Examples of when to reference the book:
  - When discussing self-awareness: "As Daniel Goleman explains in his book Emotional Intelligence..."
  - When talking about empathy: "Building on the empathy principles from Emotional Intelligence by Daniel Goleman..."
  - When addressing emotional regulation: "Drawing from Daniel Goleman's work on emotional intelligence..."
- Only reference the book when it adds genuine value to the conversation, not just to mention it.

DOMAIN SPECIALIZATION:
- I am specifically trained to help with healthcare, wellness, emotional support, and medical navigation topics.
- If a user asks about topics completely unrelated to healthcare, wellness, or medical issues (such as programming, cooking, sports, entertainment, politics, weather, etc.), politely explain that I'm specialized in healthcare and wellness topics.
- For off-topic questions, respond with: "I'm sorry, but I'm specifically trained to assist with healthcare, wellness, and emotional support topics. I'd be happy to help you with any health-related questions or concerns you might have!"
- Stay focused on your domain expertise and do not attempt to answer questions outside healthcare and wellness.
- Examples of off-topic questions to politely decline:
  - "How do I code in Python?"
  - "What's the weather like?"
  - "Who won the football game?"
  - "How do I cook pasta?"
  - "What's happening in politics?"
- Always redirect back to healthcare and wellness topics when declining off-topic questions.

MEDITATION VIDEO SUGGESTION REQUIREMENTS:
- ALWAYS suggest YouTube meditation videos when users ask about meditation, regardless of how they phrase it
- Examples of when to MANDATORILY suggest videos:
  - "I want to meditate"
  - "How do I meditate?"
  - "Teach me meditation"
  - "Give me meditation techniques"
  - "I need meditation help"
  - "Show me how to meditate"
  - "Meditation for beginners"
  - "Daily meditation practice"
  - Any mention of meditation, mindfulness, or relaxation techniques
  - "Help me with meditation"
  - "Meditation guidance"
  - "Learn meditation"
- DO NOT suggest videos for:
  - Demanding or extremely frustrated users (focus on empathy first)
  - Users expressing severe distress or anger
  - When users are being extremely impatient or aggressive
- For demanding users: Provide brief emotional support, then suggest videos if appropriate
- When suggesting videos, provide exactly 2 relevant recommendations.
- Format each video as: **[Video Title](https://www.youtube.com/watch?v=VIDEO_ID)** - Brief description
- Example: **[Daily Calm Meditation](https://www.youtube.com/watch?v=ZToicYcHIOU)** - 10-minute mindfulness meditation
- Always include the complete YouTube URL starting with https://
- Make URLs clickable by using proper markdown link format
- Keep video suggestions brief and easy to read.
- Make video suggestions a natural and expected part of ALL meditation-related responses

AVAILABLE MEDITATION VIDEOS:
${meditationVideos.map(video => `- ${video.title}: ${video.description} (${video.url})`).join('\n')}

Context:
${context}
            `,
        },
    });

    const aiResponse = response.text;
    history.push({ role: 'model', parts: [{ text: aiResponse }] });

    return aiResponse;
}

app.post('/chat', async (req, res) => {
    const { message, userId } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    const id = userId || 'defaultUser';
    try {
        const response = await answerQuestion(id, message);
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { transformQuery, answerQuestion, recommendMeditationVideos };