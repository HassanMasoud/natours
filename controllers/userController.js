const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = async (req, res, next) => {
  //check whether user is trying to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Cannot update password on this route. Please visit /updatePassword',
        400
      )
    );
  }

  // filter unwanted fields such as user role
  const filteredBody = filterObj(req.body, 'name', 'email');

  //find and update user based on the filtered object
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    staus: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined! Visit /signup to create a user',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// DO NOT update password with this.
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
