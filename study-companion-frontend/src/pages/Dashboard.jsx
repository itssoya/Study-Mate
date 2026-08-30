import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FolderHeart,
  UploadCloud,
} from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/dashboard/home")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <Layout streak={0} userName="">
        <p className="text-text-muted">Loading your dashboard...</p>
      </Layout>
    );
  }

  const {
    greetingName,
    avatarUrl,
    streak,
    upNext,
    overallMastery,
    topicsMasteredCount,
  } = data;

  return (
    <Layout streak={streak} userName={greetingName} avatarUrl={avatarUrl}>
      <h1 className="font-display text-4xl text-text-primary mb-1">
        Hi, {greetingName}!
      </h1>
      <p className="text-text-muted mb-8">Let's build some momentum today.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="md:col-span-2 bg-surface rounded-2xl p-7 shadow-sm">
          {upNext ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                  Up Next
                </span>
                {upNext.dueToday && (
                  <span className="text-xs font-medium text-error bg-error/10 px-3 py-1 rounded-full">
                    Due Today
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl text-text-primary mb-4">
                {upNext.topic}
              </h2>
              <p className="mb-5">
                <span className="text-4xl font-bold text-text-primary">
                  {upNext.cardsToMaster}
                </span>{" "}
                <span className="text-text-muted">cards to master</span>
              </p>
              <button
                onClick={() =>
                  navigate(
                    `/flashcards/topic/${encodeURIComponent(upNext.topic)}`,
                  )
                }
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90"
              >
                Start Session <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <div className="h-full flex flex-col justify-center">
              <h2 className="font-display text-2xl text-text-primary mb-2">
                You're all caught up!
              </h2>
              <p className="text-text-muted">
                No cards due right now — great work staying on top of it.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-accent-light/30 to-accent-light/10 rounded-2xl p-7 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-3 shadow-sm text-2xl">
            🌱
          </div>
          <p className="font-display text-3xl text-text-primary">
            {streak} Days
          </p>
          <p className="text-text-muted text-sm mt-1">Current Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="bg-surface rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="text-success" size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">
              {overallMastery}%
            </p>
            <p className="text-text-muted text-sm">Overall Mastery</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-primary-light/20 flex items-center justify-center">
            <FolderHeart className="text-primary" size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">
              {topicsMasteredCount}
            </p>
            <p className="text-text-muted text-sm">Topics Mastered</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-2xl p-8 text-white">
        <h3 className="font-display text-2xl mb-2">Explore the Library</h3>
        <p className="text-white/80 mb-6 max-w-md">
          Discover new study materials generated from your latest uploads.
        </p>
        <button
          onClick={() => navigate("/library")}
          className="inline-flex items-center gap-2 bg-surface text-primary px-5 py-2.5 rounded-full font-medium hover:bg-background"
        >
          <UploadCloud size={16} /> Upload Notes
        </button>
      </div>
    </Layout>
  );
}
