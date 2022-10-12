const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Each tour must have a name'],
    unique: true,
    trim: true,
  },
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
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
