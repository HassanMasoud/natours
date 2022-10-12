class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //create a copy of the object and then delete each of the reserved fields from the new object
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((query) => delete queryObj[query]);

    //turn the filtered object into a string and add dollar signs to any of the reserved keywords
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    // This returns another query which we can chain methods to such as sort, select, skip, limit etc.
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //take all sorting criteria and remove commas to have one string
      const sortCriteria = this.queryString.sort.split(',').join(' ');
      this.query.sort(sortCriteria);
    } else {
      //otherwise default to sorting by most recent and in alphabetical order
      this.query.sort('-createdOn name');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
