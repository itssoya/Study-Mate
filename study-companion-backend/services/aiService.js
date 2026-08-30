const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Updated helper function to accept a schema
async function generateAnswer(prompt, schema) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// 2. Detect Subject & Topics
exports.detectSubjectAndTopics = async (text) => {
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      subject: {
        type: SchemaType.STRING,
        description: "The main subject of the material",
      },
      topics: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "3-6 topic groups",
      },
    },
    required: ["subject", "topics"],
  };

  const prompt = `Analyze this study material and identify the subject and 3-6 topic groups.
Material:
${text.slice(0, 8000)}`;

  return generateAnswer(prompt, schema);
};

// 3. Generate Flashcards
exports.generateFlashcards = async (text, topics) => {
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      flashcards: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            question: { type: SchemaType.STRING },
            answer: { type: SchemaType.STRING },
            topic: { type: SchemaType.STRING },
          },
          required: ["question", "answer", "topic"],
        },
      },
    },
    required: ["flashcards"],
  };

  const prompt = `Create 10-15 flashcards from this study material, covering these topics: ${topics.join(", ")}.
Material:
${text.slice(0, 8000)}`;

  return generateAnswer(prompt, schema);
};

// 4. Generate Quiz
exports.generateQuiz = async (text, topics) => {
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      questions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            question: { type: SchemaType.STRING },
            options: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Exactly 4 multiple choice options (A, B, C, D)",
            },
            correctAnswer: {
              type: SchemaType.STRING,
              description: "The exact text of the correct option",
            },
            topic: { type: SchemaType.STRING },
          },
          required: ["question", "options", "correctAnswer", "topic"],
        },
      },
    },
    required: ["questions"],
  };

  const prompt = `Create 5 multiple-choice questions from this study material, covering these topics: ${topics.join(", ")}.
Material:
${text.slice(0, 8000)}`;

  return generateAnswer(prompt, schema);
};

// Generate flashcards ONLY for concepts the student got wrong on a quiz
exports.generateFlashcardsFromMistakes = async (wrongQuestions) => {
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      flashcards: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            question: { type: SchemaType.STRING },
            answer: { type: SchemaType.STRING },
            topic: { type: SchemaType.STRING },
          },
          required: ["question", "answer", "topic"],
        },
      },
    },
    required: ["flashcards"],
  };

  const missedList = wrongQuestions
    .map(
      (q) =>
        `- Topic: ${q.topic} | Missed question: ${q.question} | Correct answer: ${q.correctAnswer}`,
    )
    .join("\n");

  const prompt = `A student got these quiz questions wrong. For each one, write a flashcard that reinforces the underlying concept — don't just restate the quiz question, reframe it as a clear, memorable Q&A that helps them understand why the correct answer is right.

Missed questions:
${missedList}`;

  return generateAnswer(prompt, schema);
};

// Generate a retest quiz covering a whole topic/subject broadly
exports.generateTopicRetestQuiz = async (text, topic) => {
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      questions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            question: { type: SchemaType.STRING },
            options: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Exactly 4 multiple choice options (A, B, C, D)",
            },
            correctAnswer: {
              type: SchemaType.STRING,
              description: "The exact text of the correct option",
            },
            topic: { type: SchemaType.STRING },
          },
          required: ["question", "options", "correctAnswer", "topic"],
        },
      },
    },
    required: ["questions"],
  };

  const prompt = `Create 8 multiple-choice questions covering the topic "${topic}" broadly, based on this study material. Spread the questions across the different sub-concepts within this topic rather than focusing on just one narrow angle — this is a retest to check overall mastery of the subject, not a single fact.

Material:
${text.slice(0, 8000)}`;

  return generateAnswer(prompt, schema);
};
