module.exports = (fn) => {
  //catchAsync takes a function as a parameter
  //it doesn't call the function right away, instead it returns an anonymous function that will call the function passed in
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
