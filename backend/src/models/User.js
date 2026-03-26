const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    platformId: {
      type: String, // Discord ID, Telegram ID, or WhatsApp number
    },
    platform: {
      type: String,
      enum: ['web', 'discord', 'telegram', 'whatsapp'],
      default: 'web',
    },
    resumes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
      },
    ],
    jobDescriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobDescription',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
