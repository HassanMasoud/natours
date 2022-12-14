const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: ['*'],
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['*'],
        scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"],
      },
    },
  })
);

// Development logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP address, try again in an hour',
});

// const loginLimiter = rateLimit({
//   max: 5,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many login attempts, try again in an hour',
// });

app.use('/api', limiter);
// app.use('/api/v1/users/login', loginLimiter);

// Body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against cross site scripting
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'difficulty',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(0);
  // console.log(req.cookies);
  next();
});

//MOUNT ROUTERS
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
