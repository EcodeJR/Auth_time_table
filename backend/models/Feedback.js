import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  timetableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    lowercase: true
  },
  level: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['first', 'second'],
    lowercase: true
  },
  
  // Rating scores (1-5 scale)
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  scheduleConvenience: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  venueQuality: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  courseDistribution: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  timeSlotDistribution: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Written feedback
  comments: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Specific issues or suggestions
  issues: [{
    type: {
      type: String,
      enum: ['schedule_conflict', 'venue_issue', 'time_slot', 'course_load', 'other'],
      required: true
    },
    description: {
      type: String,
      maxlength: 200,
      trim: true
    }
  }],
  
  // Suggestions for improvement
  suggestions: {
    type: String,
    maxlength: 300,
    trim: true
  },
  
  // Feedback metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'addressed'],
    default: 'submitted'
  },
  
  // Response from HOD/Course Rep
  response: {
    message: {
      type: String,
      maxlength: 300,
      trim: true
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
FeedbackSchema.index({ timetableId: 1, studentId: 1 }, { unique: true });
FeedbackSchema.index({ department: 1, level: 1, semester: 1 });
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ status: 1 });

// Update the updatedAt field before saving
FeedbackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for average rating
FeedbackSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.overallRating,
    this.scheduleConvenience,
    this.venueQuality,
    this.courseDistribution,
    this.timeSlotDistribution
  ];
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Ensure virtual fields are serialized
FeedbackSchema.set('toJSON', { virtuals: true });

const Feedback = mongoose.model('Feedback', FeedbackSchema);

export default Feedback;
