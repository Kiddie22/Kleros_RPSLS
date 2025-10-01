import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.DB_URL);
    console.log("Connection to DB successful");
  } catch (error) {
    console.log(error);
  }
};

export { connectDB };
