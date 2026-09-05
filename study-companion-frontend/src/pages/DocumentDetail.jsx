import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  HelpCircle,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";
import LoadingDialog from "../components/LoadingDialog";

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/documents/${id}`),
      api.get(`/documents/${id}/quizzes`),
    ])
      .then(([docRes, quizRes]) => {
        setDocument(docRes.data.document);
        setQuizzes(quizRes.data.quizzes);
      })
      .catch((err) => console.error("Failed to load document", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post(`/documents/${id}/quiz`);
      navigate(`/quiz/${data.quiz._id}`);
    } catch (err) {
      console.error("Failed to generate quiz", err);
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-text-muted">Loading document...</p>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <p className="text-text-muted">Document not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <LoadingDialog open={generating} message="Generating a new quiz..." />

      <button
        onClick={() => navigate("/library")}
        className="inline-flex items-center gap-2 border border-primary-light/40 rounded-full px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light/10 mb-8"
      >
        <ArrowLeft size={16} /> Back to Library
      </button>

      <div className="flex items-start gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary-light/20 flex items-center justify-center flex-shrink-0">
          <FileText className="text-primary" size={22} />
        </div>
        <div>
          <h1 className="font-display text-3xl text-text-primary">
            {document.title}
          </h1>
          <p className="text-text-muted">{document.subject}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <span
          className={`w-1.5 h-1.5 rounded-full ${document.status === "ready" ? "bg-success" : "bg-warning"}`}
        />
        <span className="text-xs text-text-muted capitalize">
          {document.status === "ready" ? "Ready to study" : document.status}
        </span>
      </div>

      <div className="bg-surface rounded-2xl p-6 shadow-sm mb-8">
        <p className="text-sm font-medium text-text-primary mb-3">
          Topics covered
        </p>
        <div className="flex flex-wrap gap-2">
          {document.topics?.map((topic) => (
            <span
              key={topic}
              className="text-xs bg-primary-light/20 text-primary px-3 py-1.5 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-text-primary">
          Quizzes from this document
        </h2>
        <button
          onClick={handleGenerateQuiz}
          disabled={generating}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          <Sparkles size={14} /> Generate New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-text-muted text-sm">
          No quizzes yet — generate one above to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <button
              key={quiz._id}
              onClick={() => navigate(`/quiz/${quiz._id}`)}
              className="bg-surface rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-light/20 flex items-center justify-center">
                  {quiz.isRetest ? (
                    <RefreshCcw className="text-primary" size={16} />
                  ) : (
                    <HelpCircle className="text-primary" size={16} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-text-primary text-sm">
                    {quiz.topic}
                  </p>
                  <p className="text-text-muted text-xs">
                    {quiz.questionCount} questions
                  </p>
                </div>
              </div>
              <ChevronRight className="text-text-muted" size={18} />
            </button>
          ))}
        </div>
      )}
    </Layout>
  );
}
