const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  try {
    require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connection Sucessful");
  } catch (err) {
    console.log(`DB Connection Failed ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
