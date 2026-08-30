import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Copy, Play } from "lucide-react";
import api from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function RoomLobby() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/rooms/${code}`).then((res) => setRoom(res.data.room));

    socket.connect();

    console.log("joining as user:", user);
    socket.emit("join_room", { code, userId: user.id, name: user.name });

    socket.emit("join_room", { code, userId: user.id, name: user.name });

    socket.on("room_update", ({ room }) => setRoom(room));
    socket.on("quiz_started", () => navigate(`/room/${code}/play`));
    socket.on("room_error", ({ message }) => alert(message));

    return () => {
      socket.off("room_update");
      socket.off("quiz_started");
      socket.off("room_error");
    };
  }, [code, user, navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const startQuiz = () => socket.emit("start_quiz", { code });

  if (!room) {
    return (
      <Layout>
        <p className="text-text-muted">Loading room...</p>
      </Layout>
    );
  }

  const isHost = room.hostUserId === user.id;

  return (
    <Layout>
      <div className="max-w-md mx-auto text-center bg-surface rounded-2xl p-10 shadow-sm mt-6">
        <Users className="text-primary mx-auto mb-3" size={28} />
        <p className="text-text-muted mb-2">Room Code</p>
        <button
          onClick={copyCode}
          className="flex items-center justify-center gap-2 mx-auto font-display text-4xl tracking-widest text-text-primary mb-6 hover:text-primary transition-colors"
        >
          {room.code} <Copy size={20} />
        </button>
        {copied && <p className="text-success text-sm mb-4">Copied!</p>}

        <p className="text-text-muted text-sm mb-4">
          Players in room ({room.players.length})
        </p>
        <div className="space-y-2 mb-6">
          {room.players.map((p) => (
            <p key={p.userId} className="text-text-primary font-medium">
              {p.name}
            </p>
          ))}
        </div>

        {isHost ? (
          <button
            onClick={startQuiz}
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 mx-auto"
          >
            <Play size={16} /> Start Quiz
          </button>
        ) : (
          <p className="text-text-muted text-sm">
            Waiting for the host to start...
          </p>
        )}
      </div>
    </Layout>
  );
}
