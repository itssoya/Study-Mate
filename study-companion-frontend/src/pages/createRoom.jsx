import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UploadCloud, BookOpen } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";
import LoadingDialog from "../components/LoadingDialog";

export default function CreateRoom() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
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
    setError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/rooms/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/room/${data.room.code}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create room. Please try again.",
      );
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
      setError(
        err.response?.data?.message ||
          "Failed to create room. Please try again.",
      );
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

      <h1 className="font-display text-4xl text-text-primary mb-1">
        Quiz Room
      </h1>
      <p className="text-text-muted mb-8">
        Upload material to create a live quiz room — friends join with a code
        and compete in real time.
      </p>

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
        {error && <p className="text-error text-sm mt-4">{error}</p>}
      </div>

      {documents.length > 0 && (
        <div className="max-w-xl mt-10">
          <p className="text-text-muted text-sm mb-3">
            Or start a room from something you've already uploaded
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc._id}
                onClick={() => handleCreateFromDocument(doc._id)}
                disabled={isBusy}
                className="w-full flex items-center justify-between bg-surface rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-light/20 flex items-center justify-center">
                    <BookOpen className="text-primary" size={16} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary text-sm">
                      {doc.title}
                    </p>
                    <p className="text-text-muted text-xs">{doc.subject}</p>
                  </div>
                </div>
                <span className="text-primary text-sm font-medium">
                  Use this
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-xl mt-10">
        <p className="text-text-muted text-sm mb-3">
          Already have a room code?
        </p>
        <form onSubmit={handleJoin} className="flex gap-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter room code"
            maxLength={6}
            disabled={isBusy}
            className="flex-1 border border-primary-light/40 rounded-lg px-4 py-2.5 uppercase tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </form>
      </div>
    </Layout>
  );
}
