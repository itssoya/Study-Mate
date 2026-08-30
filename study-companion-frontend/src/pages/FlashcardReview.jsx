import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Check, Sparkles } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function FlashcardReview() {
  const { refreshUser } = useAuth();
  const { topic } = useParams();
  const decodedTopic = decodeURIComponent(topic);
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [generatingRetest, setGeneratingRetest] = useState(false);
  const [cardShownAt, setCardShownAt] = useState(() => Date.now());

  useEffect(() => {
    api
      .get(`/flashcards/topic/${encodeURIComponent(decodedTopic)}`)
      .then((res) => setCards(res.data.flashcards))
      .catch((err) => console.error("Failed to load flashcards", err))
      .finally(() => setLoading(false));
  }, [decodedTopic]);

  const currentCard = cards[currentIndex];

  const handleReview = async (correct) => {
    if (!currentCard || submitting) return;
    setSubmitting(true);
    const durationSeconds = Math.round((Date.now() - cardShownAt) / 1000);
    try {
      await api.post(`/flashcards/${currentCard._id}/review`, {
        correct,
        durationSeconds,
      });
      await refreshUser();
      if (currentIndex + 1 >= cards.length) {
        setFinished(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setCardShownAt(Date.now());
        setFlipped(false);
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartRetest = async () => {
    const documentId = cards[0]?.documentId;
    if (!documentId) return;

    setGeneratingRetest(true);
    try {
      const { data } = await api.post(
        `/topics/${encodeURIComponent(decodedTopic)}/retest`,
        { documentId },
      );
      navigate(`/quiz/${data.quiz._id}`);
    } catch (err) {
      console.error("Failed to generate retest", err);
      setGeneratingRetest(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-text-muted">Loading flashcards...</p>
      </Layout>
    );
  }

  if (cards.length === 0) {
    return (
      <Layout>
        <p className="text-text-muted">
          No flashcards found for "{decodedTopic}".
        </p>
      </Layout>
    );
  }

  if (finished) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center bg-surface rounded-2xl p-10 shadow-sm mt-10">
          <Sparkles className="text-accent mx-auto mb-3" size={28} />
          <h2 className="font-display text-2xl text-text-primary mb-2">
            Nice work!
          </h2>
          <p className="text-text-muted mb-6">
            You've reviewed every card for{" "}
            <span className="font-medium text-text-primary">
              {decodedTopic}
            </span>
            . Ready to test if it's stuck?
          </p>
          <button
            onClick={handleStartRetest}
            disabled={generatingRetest}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {generatingRetest ? "Preparing your retest..." : "Take Retest Quiz"}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase mb-1">
          {decodedTopic}
        </p>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-1.5 bg-primary-light/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentIndex / cards.length) * 100}%` }}
            />
          </div>
          <span className="text-text-muted text-sm whitespace-nowrap">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        <div
          onClick={() => setFlipped(!flipped)}
          className="bg-surface rounded-2xl shadow-sm min-h-[280px] flex flex-col items-center justify-center text-center p-10 cursor-pointer"
        >
          <p className="font-display text-2xl text-text-primary">
            {flipped ? currentCard.answer : currentCard.question}
          </p>
          <p className="text-text-muted text-xs mt-6">Click to flip</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => handleReview(false)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-surface border border-primary-light/30 text-text-primary py-3 rounded-lg font-medium hover:bg-primary-light/10 disabled:opacity-50"
          >
            <X size={18} /> Still Learning
          </button>
          <button
            onClick={() => handleReview(true)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <Check size={18} /> Got It
          </button>
        </div>
      </div>
    </Layout>
  );
}
