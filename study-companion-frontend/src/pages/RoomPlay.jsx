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
  const [finished, setFinished] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    api.get(`/rooms/${code}`).then(async (res) => {
      const room = res.data.room;
      setIsHost(room.hostUserId === user.id);
      setLeaderboard(room.players);
      const { data } = await api.get(`/quizzes/${room.quizId}`);
      setQuiz(data.quiz);
    });

    if (!socket.connected) socket.connect();

    socket.on("question_changed", ({ questionIndex }) => {
      setQuestionIndex(questionIndex);
      setSelected(null);
    });
    socket.on("leaderboard_update", ({ players }) => setLeaderboard(players));
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

  const currentQuestion = quiz?.questions[questionIndex];

  const handleAnswer = (option) => {
    if (selected !== null) return; // one answer per question
    setSelected(option);
    const correct = option === currentQuestion.correctAnswer;
    socket.emit("submit_answer", {
      code,
      userId: user.id,
      questionIndex,
      correct,
    });
  };

  const handleNext = () => {
    socket.emit("next_question", {
      code,
      totalQuestions: quiz.questions.length,
    });
  };

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

  if (!quiz) {
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
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selected === option
                      ? "border-primary bg-primary-light/10 font-medium"
                      : "border-primary-light/30 hover:bg-primary-light/5"
                  } disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {isHost && (
            <button
              onClick={handleNext}
              className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90"
            >
              {questionIndex + 1 >= quiz.questions.length
                ? "Finish Quiz"
                : "Next Question"}
            </button>
          )}
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
