import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ChevronRight, Trash2 } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function FlashcardTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleDelete = async (e, topic) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete all flashcards for "${topic}"? This cannot be undone.`,
      )
    )
      return;
    try {
      await api.delete(`/flashcards/topic/${encodeURIComponent(topic)}`);
      setTopics((prev) => prev.filter((t) => t.topic !== topic));
    } catch (err) {
      console.error("Failed to delete flashcards", err);
    }
  };

  useEffect(() => {
    api
      .get("/flashcards/topics")
      .then((res) => setTopics(res.data.topics))
      .catch((err) => console.error("Failed to load topics", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="font-display text-4xl text-text-primary mb-1">
        Flashcards
      </h1>
      <p className="text-text-muted mb-8">
        Pick a topic to review — cards here come from things you've missed on
        quizzes.
      </p>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : topics.length === 0 ? (
        <div className="bg-surface rounded-2xl p-10 text-center">
          <Layers className="text-text-muted mx-auto mb-3" size={28} />
          <p className="font-medium text-text-primary">No flashcards yet</p>
          <p className="text-text-muted text-sm mt-1">
            Take a quiz first — any questions you miss will show up here as
            flashcards to review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(({ topic, cardCount }) => (
            <button
              key={topic}
              onClick={() =>
                navigate(`/flashcards/topic/${encodeURIComponent(topic)}`)
              }
              className="bg-surface rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-shadow flex items-center justify-between relative group"
            >
              <div>
                <p className="font-medium text-text-primary">{topic}</p>
                <p className="text-text-muted text-sm mt-1">
                  {cardCount} card{cardCount !== 1 ? "s" : ""} to review
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(e, topic)}
                  className="text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight className="text-text-muted" size={20} />
              </div>
            </button>
          ))}
        </div>
      )}
    </Layout>
  );
}
