const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'The review cannot be empty.'],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'The review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'The review needs an author.'],
    },
  },
  // display virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query Middleware
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    // find all reviews with the tourId
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        // add 1 for each document returned
        nRatings: { $sum: 1 },
        // calculate and store the average of the rating field only
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4,
    });
  }
};

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // find the current review and save it. This allows us to have access to it in the next middleware.
  // we can't do the calculations since the document has not been updated
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // After updating the document, calculate the averages using the tour id found in r that was
  // passed in by the previous middleware
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

reviewSchema.post('save', function () {
  // this points to the current review. This is why we have access to the tourId
  // this.constructor points to the current model
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
