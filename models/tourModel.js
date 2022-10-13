const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Each tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Each tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Each tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Each tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Each tour must have a price'],
    },
    priceDiscout: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'Each tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Each tour must have a cover image'],
    },
    images: [String],
    createdOn: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Document Middleware: Runs before .save() or .create() but not before .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query Middlware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`The query took ${Date.now() - this.start} ms`);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
