import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, FileText, Plus } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";

const FILE_ICON_COLORS = {
  pdf: "bg-error/10 text-error",
  docx: "bg-primary-light/20 text-primary",
  pptx: "bg-accent-light/20 text-accent",
};

export default function Library() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [lastUpload, setLastUpload] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const navigate = useNavigate();

  const loadDocuments = () => {
    api
      .get("/documents")
      .then((res) => setDocuments(res.data.documents))
      .catch((err) => console.error("Failed to load documents", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (file) => {
    setError("");
    setUploading(true);
    setLastUpload(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLastUpload(data.document);
      loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <Layout>
      <h1 className="font-display text-4xl text-text-primary mb-1">
        Upload Material
      </h1>
      <p className="text-text-muted mb-8">
        Drop your lecture notes, PDFs, or presentations here. We'll extract the
        key concepts and build your study set.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div
          className={`md:col-span-2 border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-primary bg-primary-light/10"
              : "border-primary-light/40 bg-surface"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
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
            <Lock className="text-white" size={22} />
          </div>
          {uploading ? (
            <>
              <p className="font-medium text-text-primary">
                Processing your document...
              </p>
              <p className="text-text-muted text-sm mt-1">
                Detecting topics and generating your quiz
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-text-primary">
                Drag & Drop Files Here
              </p>
              <p className="text-text-muted text-sm mt-1">
                or browse from your computer
              </p>
            </>
          )}
          <div className="flex items-center gap-4 mt-5 text-xs text-text-muted">
            <span>PDF</span>
            <span>DOCX</span>
            <span>PPTX</span>
          </div>
          {error && <p className="text-error text-sm mt-4">{error}</p>}
        </div>

        <div className="bg-surface rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <FileText className="text-white" size={14} />
            </div>
            <span className="font-medium text-text-primary text-sm">
              Live Preview
            </span>
          </div>
          {lastUpload ? (
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">
                {lastUpload.subject}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lastUpload.topics?.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs bg-primary-light/20 text-primary px-2 py-1 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-6">
              <EyeOff className="text-text-muted mb-2" size={20} />
              <p className="text-text-muted text-xs">
                Extracted topics will appear here as we process your document.
              </p>
            </div>
          )}
        </div>
      </div>

      <h2 className="font-display text-2xl text-text-primary mb-4">
        Recent Uploads
      </h2>
      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : documents.length === 0 ? (
        <p className="text-text-muted">
          No uploads yet — drop a file above to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => navigate(`/library/${doc._id}`)}
              className="bg-surface rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${FILE_ICON_COLORS[doc.fileType] || "bg-primary-light/20 text-primary"}`}
              >
                <FileText size={18} />
              </div>
              <p className="font-medium text-text-primary truncate">
                {doc.title}
              </p>
              <p className="text-text-muted text-xs mt-0.5">
                {doc.topics?.length || 0} topics
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${doc.status === "ready" ? "bg-success" : "bg-warning"}`}
                />
                <span className="text-xs text-text-muted capitalize">
                  {doc.status === "ready" ? "Ready to study" : doc.status}
                </span>
              </div>
            </div>
          ))}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary-light/40 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Plus className="text-text-muted mb-1" size={20} />
            <span className="text-text-muted text-sm">Upload more</span>
          </div>
        </div>
      )}
    </Layout>
  );
}
