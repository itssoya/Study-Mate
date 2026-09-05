import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UploadCloud, BookOpen, LogIn, Plus } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";
import LoadingDialog from "../components/LoadingDialog";
import ErrorDialog from "../components/ErrorDialog";

export default function CreateRoom() {
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'join'
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [documents, setDocuments] = useState([]);
  const [creatingFromDoc, setCreatingFromDoc] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/documents")
      .then((res) =>
        setDocuments(res.data.documents.filter((d) => d.status === "ready")),
      )
      .catch((err) => console.error("Failed to load documents", err));
  }, []);

  const handleUpload = async (file) => {
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/rooms/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/room/${data.room.code}`);
    } catch (err) {
      setError({
        message:
          err.response?.data?.message ||
          "Failed to create room. Please try again.",
        retryable: err.response?.data?.retryable || false,
      });
      setUploading(false);
    }
  };

  const handleCreateFromDocument = async (docId) => {
    setCreatingFromDoc(docId);
    try {
      const { data } = await api.post("/rooms/create-from-document", {
        documentId: docId,
      });
      navigate(`/room/${data.room.code}`);
    } catch (err) {
      setError({
        message:
          err.response?.data?.message ||
          "Failed to create room. Please try again.",
        retryable: err.response?.data?.retryable || false,
      });
      setCreatingFromDoc(null);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  const isBusy = uploading || creatingFromDoc !== null;

  return (
    <Layout>
      <LoadingDialog
        open={isBusy}
        message={
          uploading
            ? "Building your quiz room..."
            : "Setting up your quiz room..."
        }
      />
      <ErrorDialog
        open={!!error}
        onClose={() => setError(null)}
        onRetry={() => setError(null)}
        retryable={error?.retryable}
        message={error?.message}
      />

      <h1 className="font-display text-4xl text-text-primary mb-1">
        Quiz Room
      </h1>
      <p className="text-text-muted mb-8">
        Create a live quiz room, or join one with a code.
      </p>

      {/* Tabs */}
      <div className="inline-flex bg-surface rounded-full p-1 shadow-sm mb-8">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "create"
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Plus size={16} /> Create a Room
        </button>
        <button
          onClick={() => setActiveTab("join")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "join"
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <LogIn size={16} /> Join a Room
        </button>
      </div>

      {activeTab === "join" ? (
        <div className="max-w-md bg-surface rounded-2xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary-light/20 flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-primary" size={22} />
          </div>
          <p className="font-display text-xl text-text-primary mb-1">
            Enter a Room Code
          </p>
          <p className="text-text-muted text-sm mb-6">
            Ask the host for their 6-character code.
          </p>
          <form onSubmit={handleJoin} className="flex gap-3">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              autoFocus
              className="flex-1 border border-primary-light/40 rounded-lg px-4 py-3 uppercase tracking-widest text-center font-display text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 rounded-lg font-medium hover:bg-primary/90"
            >
              Join
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div
            onClick={() => !isBusy && fileInputRef.current?.click()}
            className={`max-w-xl border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors ${
              isBusy
                ? "border-primary-light/20 bg-background opacity-50 cursor-not-allowed"
                : "border-primary-light/40 bg-surface cursor-pointer hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleUpload(e.target.files[0])
              }
            />
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4">
              <Users className="text-white" size={22} />
            </div>
            <p className="font-medium text-text-primary flex items-center gap-2">
              <UploadCloud size={18} /> Upload material to start
            </p>
            <p className="text-text-muted text-sm mt-1">PDF, DOCX, or PPTX</p>
          </div>

          {documents.length > 0 && (
            <div className="max-w-xl mt-8">
              <p className="text-text-muted text-sm mb-3">
                Or start a room from something you've already uploaded
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() => handleCreateFromDocument(doc._id)}
                    disabled={isBusy}
                    className="w-full flex items-center justify-between bg-surface rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary-light/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="text-primary" size={16} />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-medium text-text-primary text-sm truncate">
                          {doc.title}
                        </p>
                        <p className="text-text-muted text-xs truncate">
                          {doc.subject}
                        </p>
                      </div>
                    </div>
                    <span className="text-primary text-sm font-medium flex-shrink-0 ml-3">
                      Use this
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
