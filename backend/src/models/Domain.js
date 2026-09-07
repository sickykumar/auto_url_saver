const mongoose = require('mongoose');

const DomainSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    favicon: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: ['Development'],
    },
    visitedUrls: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per user + domain
DomainSchema.index({ userId: 1, domain: 1 }, { unique: true });

module.exports = mongoose.model('Domain', DomainSchema);
