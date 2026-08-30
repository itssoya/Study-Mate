import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Timer, Sparkles, ChevronRight } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";

function getIntensity(count) {
  if (!count) return 0;
  if (count <= 5) return 1;
  if (count <= 15) return 2;
  if (count <= 30) return 3;
  return 4;
}

const INTENSITY_COLORS = [
  "bg-primary-light/10",
  "bg-primary-light/40",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];

function buildHeatmapWeeks(activity) {
  const map = new Map(activity.map((a) => [a._id, a.count]));
  const days = [];
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: map.get(key) || 0 });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load progress data", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <Layout>
        <p className="text-text-muted">Loading your progress...</p>
      </Layout>
    );
  }

  const { accuracyTrend, studyTime, cardsMastered, topicMastery, activity } =
    data;
  const weeks = buildHeatmapWeeks(activity);

  return (
    <Layout>
      <h1 className="font-display text-4xl text-text-primary mb-1">
        Progress Overview
      </h1>
      <p className="text-text-muted mb-8">
        Track your mastery and study habits. Consistent effort leads to lasting
        knowledge.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="md:col-span-2 bg-surface rounded-2xl p-7 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-xl text-text-primary">
              Accuracy Trend
            </h2>
            {accuracyTrend.improvementPercent !== 0 && (
              <span
                className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
                  accuracyTrend.improvementPercent > 0
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                }`}
              >
                <TrendingUp size={14} />
                {accuracyTrend.improvementPercent > 0 ? "+" : ""}
                {accuracyTrend.improvementPercent}% improvement
              </span>
            )}
          </div>
          <p className="text-text-muted text-sm mb-4">Past 30 Days</p>

          {accuracyTrend.trend.length === 0 ? (
            <p className="text-text-muted text-sm py-12 text-center">
              Take a quiz to start tracking your accuracy trend.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={accuracyTrend.trend}>
                <XAxis dataKey="date" hide />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Accuracy"]}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #7FA88A40",
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#2D5F3F"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#2D5F3F" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-primary rounded-2xl p-6 text-white flex-1 flex flex-col justify-center">
            <Timer size={20} className="mb-2 text-white/80" />
            <p className="text-xs uppercase tracking-wide text-white/70 mb-1">
              Study Time
            </p>
            <p className="text-3xl font-bold">
              {studyTime.totalHours}
              <span className="text-lg font-normal">hrs</span>
            </p>
            <p className="text-white/70 text-xs mt-1">
              {studyTime.hoursChangeFromLastWeek >= 0 ? "+" : ""}
              {studyTime.hoursChangeFromLastWeek} hrs from last week
            </p>
          </div>

          <div className="bg-success/15 rounded-2xl p-6 flex-1 flex flex-col justify-center">
            <Sparkles size={20} className="mb-2 text-success" />
            <p className="text-xs uppercase tracking-wide text-text-muted mb-1">
              Cards Mastered
            </p>
            <p className="text-3xl font-bold text-text-primary">
              {cardsMastered.cardsMastered}
            </p>
            <p className="text-text-muted text-xs mt-1">
              Top {cardsMastered.topPercent}% of users
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-xl text-text-primary mb-4">
            Topic Mastery
          </h2>
          {topicMastery.length === 0 ? (
            <p className="text-text-muted text-sm">
              No quiz data yet — take a quiz to see mastery by topic.
            </p>
          ) : (
            <div className="space-y-4">
              {topicMastery.map((t) => (
                <div key={t.topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">
                      {t.topic}
                    </span>
                    <span className="text-sm text-text-muted">
                      {t.masteryPercent}%
                    </span>
                  </div>
                  <div className="h-2 bg-primary-light/15 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${t.mastered ? "bg-success" : t.masteryPercent < 40 ? "bg-error" : "bg-warning"}`}
                      style={{ width: `${t.masteryPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="w-full mt-5 flex items-center justify-center gap-1 text-sm text-text-muted border border-primary-light/30 rounded-lg py-2.5 hover:bg-primary-light/10">
            View Detailed Breakdown <ChevronRight size={14} />
          </button>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-text-primary">
              Study Activity
            </h2>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              Less
              {INTENSITY_COLORS.map((c) => (
                <span key={c} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
              ))}
              More
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <span
                    key={day.date}
                    title={`${day.date}: ${day.count} activity`}
                    className={`w-2.5 h-2.5 rounded-sm ${INTENSITY_COLORS[getIntensity(day.count)]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
