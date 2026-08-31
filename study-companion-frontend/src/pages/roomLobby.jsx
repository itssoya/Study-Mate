import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Copy, Play } from "lucide-react";
import api from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { getAvatarEmoji } from "../utils/avatar";

const REACTION_EMOJIS = ["🔥", "😂", "👏", "😮", "💪", "🎯"];

export default function RoomLobby() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const reactionIdRef = useRef(0);

  useEffect(() => {
    api.get(`/rooms/${code}`).then((res) => setRoom(res.data.room));

    if (!socket.connected) socket.connect();
    socket.emit("join_room", { code, userId: user.id, name: user.name });

    socket.on("room_update", ({ room }) => setRoom(room));

    socket.on("countdown_start", () => {
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          setCountdown(null);
        } else {
          setCountdown(count);
        }
      }, 1000);
    });

    socket.on("quiz_started", () => navigate(`/room/${code}/play`));

    socket.on("reaction_received", ({ emoji }) => {
      const id = reactionIdRef.current++;
      const left = 10 + Math.random() * 80;
      setFloatingReactions((prev) => [...prev, { id, emoji, left }]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
      }, 1800);
    });

    socket.on("room_error", ({ message }) => alert(message));

    return () => {
      socket.off("room_update");
      socket.off("countdown_start");
      socket.off("quiz_started");
      socket.off("reaction_received");
      socket.off("room_error");
    };
  }, [code, user, navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const startQuiz = () => socket.emit("start_quiz", { code });
  const sendReaction = (emoji) => socket.emit("send_reaction", { code, emoji });

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
      <div className="max-w-md mx-auto relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {floatingReactions.map((r) => (
            <span
              key={r.id}
              className="absolute bottom-24 text-3xl"
              style={{
                left: `${r.left}%`,
                animation: "float-up 1.8s ease-out forwards",
              }}
            >
              {r.emoji}
            </span>
          ))}
        </div>

        {countdown !== null && (
          <div className="fixed inset-0 bg-primary/90 z-50 flex items-center justify-center">
            <span
              key={countdown}
              className="font-display text-white text-9xl"
              style={{ animation: "pulse-scale 1s ease-in-out" }}
            >
              {countdown}
            </span>
          </div>
        )}

        <div className="text-center bg-surface rounded-2xl p-10 shadow-sm mt-6">
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
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {room.players.map((p) => (
              <div key={p.userId} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-primary-light/20 flex items-center justify-center text-2xl">
                  {getAvatarEmoji(p.userId)}
                </div>
                <span className="text-xs font-medium text-text-primary">
                  {p.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="text-xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
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
      </div>
    </Layout>
  );
}
