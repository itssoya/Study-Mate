const QuizRoom = require("../models/QuizRoom");

module.exports = function (io) {
  io.on("connection", (socket) => {
    // JOIN a room
    socket.on("join_room", async ({ code, userId, name }) => {
      try {
        const upperCode = code.toUpperCase();
        let room = await QuizRoom.findOne({ code: upperCode });
        if (!room) {
          socket.emit("room_error", { message: "Room not found" });
          return;
        }

        socket.join(upperCode);
        socket.data.roomCode = upperCode;
        socket.data.userId = userId;

        await QuizRoom.updateOne(
          { code: upperCode, "players.userId": { $ne: userId } },
          { $push: { players: { userId, name, score: 0 } } },
        );

        room = await QuizRoom.findOne({ code: upperCode });
        io.to(upperCode).emit("room_update", { room });
      } catch (err) {
        socket.emit("room_error", { message: "Failed to join room" });
      }
    });

    // HOST starts the quiz
    socket.on("start_quiz", async ({ code }) => {
      const upperCode = code.toUpperCase();
      const room = await QuizRoom.findOne({ code: upperCode });
      if (!room) return;

      room.status = "in_progress";
      room.currentQuestionIndex = 0;
      room.answeredThisQuestion = [];
      room.questionStartedAt = new Date();
      await room.save();

      io.to(upperCode).emit("quiz_started", { questionIndex: 0 });
    });

    socket.on(
      "submit_answer",
      async ({ code, userId, questionIndex, correct, totalQuestions }) => {
        const upperCode = code.toUpperCase();
        const room = await QuizRoom.findOne({ code: upperCode });
        if (!room || room.currentQuestionIndex !== questionIndex) return; // stale/late answer, ignore

        const alreadyAnswered = room.answeredThisQuestion.some(
          (id) => id.toString() === userId,
        );
        if (alreadyAnswered) return; // one answer per player per question, ignore duplicates

        if (correct) {
          const elapsedSeconds = room.questionStartedAt
            ? (Date.now() - room.questionStartedAt.getTime()) / 1000
            : 0;
          const points = Math.max(50, 100 - Math.floor(elapsedSeconds * 5)); // faster = more points, floor of 50
          const player = room.players.find(
            (p) => p.userId.toString() === userId,
          );
          if (player) player.score += points;
        }

        room.answeredThisQuestion.push(userId);
        await room.save();

        io.to(upperCode).emit("leaderboard_update", {
          players: room.players,
          answeredCount: room.answeredThisQuestion.length,
          totalPlayers: room.players.length,
        });

        // auto-advance once EVERY player has answered — no one waits on a host click
        if (room.answeredThisQuestion.length >= room.players.length) {
          const nextIndex = room.currentQuestionIndex + 1;
          if (nextIndex >= totalQuestions) {
            room.status = "finished";
            await room.save();
            io.to(upperCode).emit("quiz_finished", { players: room.players });
          } else {
            room.currentQuestionIndex = nextIndex;
            room.answeredThisQuestion = [];
            room.questionStartedAt = new Date();
            await room.save();
            io.to(upperCode).emit("question_changed", {
              questionIndex: nextIndex,
            });
          }
        }
      },
    );

    // kept as a host-only safety net — NOT the primary flow anymore.
    // Only useful if a player disconnects mid-question and the room would otherwise wait forever.
    socket.on("force_next_question", async ({ code, totalQuestions }) => {
      const upperCode = code.toUpperCase();
      const room = await QuizRoom.findOne({ code: upperCode });
      if (!room) return;

      const nextIndex = room.currentQuestionIndex + 1;
      if (nextIndex >= totalQuestions) {
        room.status = "finished";
        await room.save();
        io.to(upperCode).emit("quiz_finished", { players: room.players });
      } else {
        room.currentQuestionIndex = nextIndex;
        room.answeredThisQuestion = [];
        room.questionStartedAt = new Date();
        await room.save();
        io.to(upperCode).emit("question_changed", { questionIndex: nextIndex });
      }
    });

    socket.on("disconnect", () => {
      // players stay in the room's player list even on disconnect —
      // simplest behavior for a portfolio project; real presence tracking is a bigger feature
    });
  });
};
