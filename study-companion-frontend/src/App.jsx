import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import FlashcardTopics from "./pages/FlashcardTopics";
import FlashcardReview from "./pages/FlashcardReview";
import QuizList from "./pages/QuizList";
import QuizTake from "./pages/QuizTake";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import CreateRoom from "./pages/createRoom";
import RoomLobby from "./pages/roomLobby";
import RoomPlay from "./pages/RoomPlay";
import Landing from "./pages/LandingPage";
import { ThemeProvider } from "./context/ThemeContext";
import DocumentDetail from "./pages/DocumentDetail";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <Library />
          </ProtectedRoute>
        }
      />

      {/* Flashcards */}
      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <FlashcardTopics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/flashcards/topic/:topic"
        element={
          <ProtectedRoute>
            <FlashcardReview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes"
        element={
          <ProtectedRoute>
            <QuizList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute>
            <QuizTake />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-room"
        element={
          <ProtectedRoute>
            <CreateRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:code"
        element={
          <ProtectedRoute>
            <RoomLobby />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:code/play"
        element={
          <ProtectedRoute>
            <RoomPlay />
          </ProtectedRoute>
        }
      />
      <Route
        path="/library/:id"
        element={
          <ProtectedRoute>
            <DocumentDetail />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
