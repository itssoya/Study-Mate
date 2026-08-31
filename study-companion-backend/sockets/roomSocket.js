const QuizRoom = require("../models/QuizRoom");

module.exports = function (io) {
  io.on("connection", (socket) => {
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

    // NEW — emoji reactions, broadcast instantly to everyone in the room
    socket.on("send_reaction", ({ code, emoji }) => {
      io.to(code.toUpperCase()).emit("reaction_received", {
        emoji,
        ts: Date.now(),
      });
    });

    // UPDATED — countdown before the quiz actually begins
    socket.on("start_quiz", async ({ code }) => {
      const upperCode = code.toUpperCase();
      const room = await QuizRoom.findOne({ code: upperCode });
      if (!room) return;

      io.to(upperCode).emit("countdown_start");

      setTimeout(async () => {
        const freshRoom = await QuizRoom.findOne({ code: upperCode });
        if (!freshRoom) return;

        freshRoom.status = "in_progress";
        freshRoom.currentQuestionIndex = 0;
        freshRoom.answeredThisQuestion = [];
        freshRoom.questionStartedAt = new Date();
        await freshRoom.save();

        io.to(upperCode).emit("quiz_started", { questionIndex: 0 });
      }, 3000);
    });

    socket.on(
      "submit_answer",
      async ({ code, userId, questionIndex, correct, totalQuestions }) => {
        const upperCode = code.toUpperCase();
        const room = await QuizRoom.findOne({ code: upperCode });
        if (!room || room.currentQuestionIndex !== questionIndex) return;

        const alreadyAnswered = room.answeredThisQuestion.some(
          (id) => id.toString() === userId,
        );
        if (alreadyAnswered) return;

        if (correct) {
          const elapsedSeconds = room.questionStartedAt
            ? (Date.now() - room.questionStartedAt.getTime()) / 1000
            : 0;
          const points = Math.max(50, 100 - Math.floor(elapsedSeconds * 5));
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

    socket.on("disconnect", () => {});
  });
};
