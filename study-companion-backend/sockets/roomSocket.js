const QuizRoom = require("../models/QuizRoom");

module.exports = function (io) {
  io.on("connection", (socket) => {
    // JOIN a room
    socket.on("join_room", async ({ code, userId, name }) => {
      try {
        const room = await QuizRoom.findOne({ code: code.toUpperCase() });
        if (!room) {
          socket.emit("room_error", { message: "Room not found" });
          return;
        }

        socket.join(code.toUpperCase());
        socket.data.roomCode = code.toUpperCase();
        socket.data.userId = userId;

        const alreadyIn = room.players.some(
          (p) => p.userId.toString() === userId,
        );
        if (!alreadyIn) {
          room.players.push({ userId, name, score: 0 });
          await room.save();
        }

        io.to(code.toUpperCase()).emit("room_update", { room });
      } catch (err) {
        socket.emit("room_error", { message: "Failed to join room" });
      }
    });

    // HOST starts the quiz
    socket.on("start_quiz", async ({ code }) => {
      const room = await QuizRoom.findOne({ code: code.toUpperCase() });
      if (!room) return;

      room.status = "in_progress";
      room.currentQuestionIndex = 0;
      await room.save();

      io.to(code.toUpperCase()).emit("quiz_started", { questionIndex: 0 });
    });

    // PLAYER submits an answer for the current question
    socket.on(
      "submit_answer",
      async ({ code, userId, questionIndex, correct }) => {
        const room = await QuizRoom.findOne({ code: code.toUpperCase() });
        if (!room || room.currentQuestionIndex !== questionIndex) return; // ignore late/stale answers

        if (correct) {
          const player = room.players.find(
            (p) => p.userId.toString() === userId,
          );
          if (player) player.score += 100;
          await room.save();
        }

        io.to(code.toUpperCase()).emit("leaderboard_update", {
          players: room.players,
        });
      },
    );

    // HOST advances to the next question
    socket.on("next_question", async ({ code, totalQuestions }) => {
      const room = await QuizRoom.findOne({ code: code.toUpperCase() });
      if (!room) return;

      const nextIndex = room.currentQuestionIndex + 1;

      if (nextIndex >= totalQuestions) {
        room.status = "finished";
        await room.save();
        io.to(code.toUpperCase()).emit("quiz_finished", {
          players: room.players,
        });
      } else {
        room.currentQuestionIndex = nextIndex;
        await room.save();
        io.to(code.toUpperCase()).emit("question_changed", {
          questionIndex: nextIndex,
        });
      }
    });

    socket.on("disconnect", () => {
      // players stay in the room's player list even on disconnect —
      // simplest behavior for a portfolio project; real presence tracking is a bigger feature
    });
  });
};
