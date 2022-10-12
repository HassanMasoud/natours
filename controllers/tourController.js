const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // Filtering
    //create a copy of the object and then delete each of the reserved fields from the new object
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((query) => delete queryObj[query]);

    // Advance Filtering
    //turn the filtered object into a string and add dollar signs to any of the reserved keywords
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    const query = Tour.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      //take all sorting criteria and remove commas to have one string
      const sortCriteria = req.query.sort.split(',').join(' ');
      query.sort(sortCriteria);
    } else {
      //otherwise default to sorting by most recent and in alphabetical order
      query.sort('-createdOn name');
    }

    //Limiting results (Projecting)
    if (req.query.limit) {
      const limitingCriteria = req.query.limit.split(',').join(' ');
      query.select(limitingCriteria);
    } else {
      query.select('-__v');
    }

    // Execute Query
    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  // const newTour = new Tour({})
  // newTour.save()

  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
