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
    ratingData: [
      {
        rating: { type: Number },
        userId: { type: Schema.Types.ObjectId },
      },
    ],
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    category: {
      type: String,
      required: true,
    },
    comments: [
      {
        comment: { type: String },
        userId: { type: Schema.Types.ObjectId },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
