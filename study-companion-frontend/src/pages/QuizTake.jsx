import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function QuizTake() {
  const { refreshUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizStartedAt] = useState(() => Date.now());

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get(`/quizzes/${id}`)
      .then((res) => setQuiz(res.data.quiz))
      .catch((err) => console.error("Failed to load quiz", err))
      .finally(() => setLoading(false));
  }, [id]);

  const currentQuestion = quiz?.questions[currentIndex];
  const isLastQuestion = quiz && currentIndex === quiz.questions.length - 1;

  const handleNext = async () => {
    if (selected === null) return;

    const updatedAnswers = [
      ...answers,
      { questionIndex: currentIndex, selectedAnswer: selected },
    ];
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      setSubmitting(true);
      const totalSeconds = Math.round((Date.now() - quizStartedAt) / 1000);
      const perQuestionSeconds = Math.max(
        1,
        Math.round(totalSeconds / quiz.questions.length),
      );

      const answersWithDuration = updatedAnswers.map((a) => ({
        ...a,
        durationSeconds: perQuestionSeconds,
      }));

      try {
        const { data } = await api.post(`/quizzes/${id}/attempt`, {
          answers: answersWithDuration,
        });
        await refreshUser();
        setResult(data);
      } catch (err) {
        console.error("Failed to submit quiz", err);
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-text-muted">Loading quiz...</p>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <p className="text-text-muted">Quiz not found.</p>
      </Layout>
    );
  }

  if (result) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center bg-surface rounded-2xl p-10 shadow-sm mt-10">
          {result.topicMastered ? (
            <>
              <Trophy className="text-accent mx-auto mb-3" size={32} />
              <h2 className="font-display text-2xl text-text-primary mb-2">
                Topic Mastered!
              </h2>
              <p className="text-text-muted mb-6">
                Perfect score —{" "}
                <span className="font-medium text-text-primary">
                  {quiz.topic}
                </span>{" "}
                is officially mastered. Its flashcards have been cleared,
                nothing left to review.
              </p>
            </>
          ) : (
            <>
              <Sparkles className="text-primary mx-auto mb-3" size={28} />
              <h2 className="font-display text-2xl text-text-primary mb-2">
                {result.scorePercent}%
              </h2>
              <p className="text-text-muted mb-2">
                {result.attempt.score} out of {result.totalQuestions} correct
              </p>
              {result.flashcardsCreated > 0 && (
                <p className="text-text-muted text-sm mb-6">
                  {result.flashcardsCreated} new flashcard
                  {result.flashcardsCreated !== 1 ? "s" : ""} created for what
                  you missed.
                </p>
              )}
            </>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => navigate("/flashcards")}
              className="bg-surface border border-primary-light/30 text-text-primary px-5 py-2.5 rounded-lg font-medium hover:bg-primary-light/10"
            >
              View Flashcards
            </button>
            <button
              onClick={() => navigate("/quizzes")}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase mb-1">
          {quiz.topic}
        </p>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-1.5 bg-primary-light/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${(currentIndex / quiz.questions.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-text-muted text-sm whitespace-nowrap">
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm p-8">
          <h2 className="font-display text-xl text-text-primary mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  selected === option
                    ? "border-primary bg-primary-light/10 text-text-primary font-medium"
                    : "border-primary-light/30 text-text-primary hover:bg-primary-light/5"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={selected === null || submitting}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : isLastQuestion
              ? "Submit Quiz"
              : "Next Question"}
          {!submitting && <ArrowRight size={16} />}
        </button>
      </div>
    </Layout>
  );
}
