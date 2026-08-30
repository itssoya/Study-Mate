import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import api from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function RoomPlay() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadRoomAndQuiz() {
      try {
        const roomRes = await api.get(`/rooms/${code}`);
        const room = roomRes.data.room;
        setIsHost(room.hostUserId === user.id);
        setLeaderboard(room.players);
        setTotalPlayers(room.players.length);

        const quizRes = await api.get(`/rooms/${code}/quiz`);
        setQuiz(quizRes.data.quiz);
      } catch (err) {
        console.error("Failed to load room/quiz", err);
        setLoadError("Failed to load the quiz for this room.");
      }
    }
    loadRoomAndQuiz();

    if (!socket.connected) socket.connect();
    socket.emit("join_room", { code, userId: user.id, name: user.name });

    socket.on("question_changed", ({ questionIndex }) => {
      setQuestionIndex(questionIndex);
      setSelected(null);
      setAnsweredCount(0);
    });

    socket.on(
      "leaderboard_update",
      ({ players, answeredCount, totalPlayers }) => {
        setLeaderboard(players);
        setAnsweredCount(answeredCount);
        setTotalPlayers(totalPlayers);
      },
    );

    socket.on("quiz_finished", ({ players }) => {
      setLeaderboard(players);
      setFinished(true);
    });

    return () => {
      socket.off("question_changed");
      socket.off("leaderboard_update");
      socket.off("quiz_finished");
    };
  }, [code, user]);

  const currentQuestion = quiz?.questions?.[questionIndex];

  const handleAnswer = (option) => {
    if (selected !== null || !currentQuestion || !quiz) return;
    setSelected(option);
    const correct = option === currentQuestion.correctAnswer;
    socket.emit("submit_answer", {
      code,
      userId: user.id,
      questionIndex,
      correct,
      totalQuestions: quiz.questions.length,
    });
  };

  const handleForceNext = () => {
    if (!quiz) return;
    socket.emit("force_next_question", {
      code,
      totalQuestions: quiz.questions.length,
    });
  };

  if (loadError) {
    return (
      <Layout>
        <p className="text-error">{loadError}</p>
      </Layout>
    );
  }

  if (finished) {
    const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center bg-surface rounded-2xl p-10 shadow-sm mt-10">
          <Trophy className="text-accent mx-auto mb-4" size={32} />
          <h2 className="font-display text-2xl text-text-primary mb-6">
            Final Results
          </h2>
          <div className="space-y-2 mb-6">
            {sorted.map((p, i) => (
              <div
                key={p.userId}
                className="flex items-center justify-between px-4 py-2 bg-background rounded-lg"
              >
                <span className="font-medium text-text-primary">
                  #{i + 1} {p.name}
                </span>
                <span className="text-primary font-bold">{p.score}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/quiz-room")}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90"
          >
            Back to Quiz Room
          </button>
        </div>
      </Layout>
    );
  }

  if (!quiz || !currentQuestion) {
    return (
      <Layout>
        <p className="text-text-muted">Loading quiz...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <p className="text-text-muted text-sm mb-2">
            Question {questionIndex + 1} of {quiz.questions.length}
          </p>
          <div className="bg-surface rounded-2xl shadow-sm p-8">
            <h2 className="font-display text-xl text-text-primary mb-6">
              {currentQuestion.question}
            </h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selected === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={selected !== null}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary-light/10 font-medium cursor-default"
                        : selected !== null
                          ? "border-primary-light/20 text-text-muted opacity-50 cursor-default"
                          : "border-primary-light/30 hover:bg-primary-light/5 cursor-pointer"
                    }`}
                  >
                    {option} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>

            <p className="text-text-muted text-sm mt-4 text-center">
              {selected !== null
                ? `Answer locked in — ${answeredCount}/${totalPlayers} players have answered.`
                : "Answer as fast as you can — speed earns bonus points!"}
            </p>

            {isHost && selected !== null && answeredCount < totalPlayers && (
              <button
                onClick={handleForceNext}
                className="text-xs text-text-muted underline mt-3 mx-auto block"
              >
                Force skip (if someone's stuck)
              </button>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm p-5">
          <h3 className="font-display text-lg text-text-primary mb-4">
            Leaderboard
          </h3>
          <div className="space-y-2">
            {[...leaderboard]
              .sort((a, b) => b.score - a.score)
              .map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-text-primary">{p.name}</span>
                  <span className="text-primary font-medium">{p.score}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
