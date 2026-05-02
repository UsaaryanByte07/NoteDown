const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    noteIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        required: true,
      },
    ],

    title: {
      type: String,
      required: true,
      trim: true,
    },

    isTerminated: {
      type: Boolean,
      default: false,
    },
    terminatedAt: {
      type: Date,
      default: null,
    },
    terminationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
