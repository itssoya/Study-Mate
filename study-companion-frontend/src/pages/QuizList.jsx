import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, ChevronRight, RefreshCcw, Trash2 } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleDelete = async (e, quizId) => {
    e.stopPropagation(); // prevent the card's onClick (navigation) from also firing
    if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      console.error("Failed to delete quiz", err);
    }
  };

  useEffect(() => {
    api
      .get("/quizzes")
      .then((res) => setQuizzes(res.data.quizzes))
      .catch((err) => console.error("Failed to load quizzes", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="font-display text-4xl text-text-primary mb-1">Quizzes</h1>
      <p className="text-text-muted mb-8">
        Pick a quiz to take — generated automatically from your uploads.
      </p>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : quizzes.length === 0 ? (
        <div className="bg-surface rounded-2xl p-10 text-center">
          <HelpCircle className="text-text-muted mx-auto mb-3" size={28} />
          <p className="font-medium text-text-primary">No quizzes yet</p>
          <p className="text-text-muted text-sm mt-1">
            Upload a document in My Library — a quiz is generated automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              onClick={() => navigate(`/quiz/${quiz._id}`)}
              className="bg-surface rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer"
            >
              <button
                onClick={(e) => handleDelete(e, quiz._id)}
                className="absolute top-3 right-3 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary-light/20 flex items-center justify-center">
                  {quiz.isRetest ? (
                    <RefreshCcw className="text-primary" size={16} />
                  ) : (
                    <HelpCircle className="text-primary" size={16} />
                  )}
                </div>
                {quiz.isRetest && (
                  <span className="text-xs font-medium text-accent bg-accent-light/20 px-2 py-0.5 rounded-full">
                    Retest
                  </span>
                )}
              </div>
              <p className="font-medium text-text-primary">{quiz.topic}</p>
              <p className="text-text-muted text-xs mt-0.5">
                {quiz.documentTitle}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-text-muted text-xs">
                  {quiz.questionCount} questions
                </span>
                <ChevronRight className="text-text-muted" size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
