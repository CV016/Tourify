// review / rating / createdAt / ref to Tour / ref to User
const mongoose = require('mongoose');
const Tour = require('./tourModels');

// const formatDate = (date) => {
//   const d = new Date(date);
//   let day = d.getDate();
//   let month = d.getMonth() + 1; // Months are zero-based
//   const year = d.getFullYear();

//   // Add leading zero to day and month if needed
//   day = day < 10 ? '0' + day : day;
//   month = month < 10 ? '0' + month : month;

//   return `${day}/${month}/${year}`;
// };

// createdAt: {
//   type: Date,
//   default: formatDate(Date.now),
// },

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      maxlength: [300, 'Maximum size limit exceede'],
      required: [true, 'A tour must have a rating'],
    },

    rating: {
      type: Number,
      required: [true, 'A tour review must have a rating'],
      max: [5, 'Rating cannot be above 5'],
      min: [1, 'Rating cannot be below 1'],
    },

    createdAtTime: {
      type: Date,
      default: Date.now,
      select: 'false',
    },

    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a Tour'],
      },
    ],

    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// Tour.findByIdAndUpdate
// findByIdAndDelete
// These wont work as these are query middlewares

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // Cannot use this.findOne() as the query has already been executed here
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
