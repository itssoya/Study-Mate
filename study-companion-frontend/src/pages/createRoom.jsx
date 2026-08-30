import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UploadCloud } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function CreateRoom() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <Layout>
      <h1 className="font-display text-4xl text-text-primary mb-1">
        Quiz Room
      </h1>
      <p className="text-text-muted mb-8">
        Upload material to create a live quiz room — friends join with a code
        and compete in real time.
      </p>

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="max-w-xl border-2 border-dashed border-primary-light/40 bg-surface rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors"
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
        {uploading ? (
          <>
            <p className="font-medium text-text-primary">
              Building your quiz room...
            </p>
            <p className="text-text-muted text-sm mt-1">
              Generating questions from your material
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-text-primary flex items-center gap-2">
              <UploadCloud size={18} /> Upload material to start
            </p>
            <p className="text-text-muted text-sm mt-1">PDF, DOCX, or PPTX</p>
          </>
        )}
        {error && <p className="text-error text-sm mt-4">{error}</p>}
      </div>

      <div className="max-w-xl mt-8">
        <p className="text-text-muted text-sm mb-3">
          Already have a room code?
        </p>
        <form onSubmit={handleJoin} className="flex gap-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter room code"
            maxLength={6}
            className="flex-1 border border-primary-light/40 rounded-lg px-4 py-2.5 uppercase tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90"
          >
            Join
          </button>
        </form>
      </div>
    </Layout>
  );
}
