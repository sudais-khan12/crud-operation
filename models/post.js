const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/project-1`);
const postSchema = mongoose.Schema({
  content: String,
  heading: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

module.exports = mongoose.model("post", postSchema);
