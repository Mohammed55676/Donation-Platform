/**
 * src/models/VolunteerOpportunity.model.js
 * Mongoose schema for volunteer opportunities shown on the Volunteer page.
 */
const mongoose = require('mongoose');

const volunteerOpportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: { type: Date, default: null },
    maxVolunteers: {
      type: Number,
      required: true,
      min: [1, 'Must allow at least 1 volunteer'],
    },
    // Current registered volunteers (incremented when a user applies)
    volunteers: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Track applicant user IDs to prevent duplicate applications
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Virtual: spots remaining
volunteerOpportunitySchema.virtual('spotsLeft').get(function () {
  return Math.max(0, this.maxVolunteers - this.volunteers);
});

volunteerOpportunitySchema.set('toJSON', { virtuals: true, transform(_, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } });

module.exports = mongoose.model('VolunteerOpportunity', volunteerOpportunitySchema);
