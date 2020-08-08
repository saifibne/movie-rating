const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    originalRating: {
      type: Number,
      required: true,
    },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    category: {
      type: String,
      required: true,
    },
    comments: [
      {
        name: { type: String },
        comment: { type: String },
        time: { type: Date },
        rating: { type: Number },
        userId: { type: Schema.Types.ObjectId },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
