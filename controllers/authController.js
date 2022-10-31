const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  //payload, secret, options
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check whether both email and password have been submitted
  if (!email || !password) {
    return next(
      new AppError('Please provide your email address and password', 400)
    );
  }

  //find user + password
  const user = await User.findOne({ email }).select('+password');

  //if user exits, then compare passwords. If either return false, throw error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect login credentials', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async function (req, res, next) {
  //Retrieve token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  //Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Check whether user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  //Confirm that the user hasn't changed the password since issuing the token
  if (currentUser.changedPassword(decoded.iat)) {
    return next(
      new AppError('You recently changed your password, please log in again')
    );
  }

  //Grant access to protected route
  req.user = currentUser;
  next();
});
