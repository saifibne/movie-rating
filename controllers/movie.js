const { validationResult } = require("express-validator");
const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const User = require("../model/user");
const Movie = require("../model/movie");
const utils = require("../utils/utils");

exports.getMovies = async (req, res, next) => {
  let currentPage = req.query.page || 1;
  const ITEMS_PER_PAGE = 8;
  if (currentPage < 1) {
    currentPage = 1;
  }
  const moviesCount = await Movie.find().countDocuments();
  const movies = await Movie.find()
    .populate("user")
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  if (!movies) {
    const error = new Error("Movies can't be found from database");
    error.statusCode = 500;
    throw error;
  }
  const changedMovies = movies.map((movie) => {
    const percentageRating = Math.round((movie.originalRating / 5) * 100);
    const totalUser = movie.comments.length;
    return {
      ...movie._doc,
      ratingInPercentage: percentageRating,
      totalUser: totalUser,
    };
  });
  const lastPage = Math.ceil(moviesCount / ITEMS_PER_PAGE);
  res.render("movies/index", {
    title: "Home",
    movies: changedMovies,
    totalMovies: moviesCount,
    currentPage: +currentPage,
    nextPage: +currentPage + 1,
    hasNextPage: currentPage * ITEMS_PER_PAGE < moviesCount,
    prevPage: +currentPage - 1,
    hasPrevPage: currentPage > 1,
    lastPage: lastPage,
    pagination: true,
  });
};

exports.getAddMovie = (req, res, next) => {
  const editing = req.query.editing;
  const flashMessage = req.flash("message");
  res.render("movies/add-movie", {
    title: "Add-Movie",
    editing: editing,
    flashMessage: flashMessage[0],
  });
};

exports.getEditMovie = async (req, res, next) => {
  const movieId = req.params.movieId;
  const editing = req.query.editing;
  const flashMessage = req.flash("message");
  let singleMovie;
  try {
    singleMovie = await Movie.findById(movieId);
  } catch (error) {
    return next(error);
  }
  if (!singleMovie) {
    const error = new Error("Could not find movie.");
    error.statusCode = 500;
    throw error;
  }
  res.render("movies/add-movie", {
    title: "Edit-Movie",
    editing: editing,
    movie: singleMovie,
    flashMessage: flashMessage[0],
  });
};

exports.postEditMovie = async (req, res, next) => {
  const errors = validationResult(req);
  if (!req.user) {
    return res.redirect("/admin/login");
  }
  if (!errors.isEmpty()) {
    req.flash(
      "message",
      "Title and description should be at least 3 character long. Please fill the form again."
    );
    return res.redirect(req.headers.referer);
  }
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedCategory = req.body.category;
  const movieId = req.body.movieId;
  const movie = await Movie.findById(movieId);
  if (!movie) {
    const error = new Error("Can't find the movie from database");
    error.statusCode = 500;
    throw error;
  }
  movie.title = updatedTitle;
  let updatedImageUrl;
  if (req.file) {
    updatedImageUrl = req.compressedImage.destinationPath;
  } else {
    updatedImageUrl = movie.imageUrl;
  }
  if (movie.imageUrl !== updatedImageUrl) {
    utils.deleteImage(movie.imageUrl);
    movie.imageUrl = updatedImageUrl;
  }
  movie.description = updatedDescription;
  movie.category = updatedCategory;
  await movie.save();
  if (req.file) {
    utils.deleteImage(req.file.path);
  }
  res.redirect("/admin-movies");
};

exports.getMovieByCategory = async (req, res, next) => {
  const movieCategory = req.params.movieCategory;
  const movies = await Movie.find({ category: movieCategory }).populate("user");
  if (!movies) {
    const error = new Error("could not find Movies");
    error.statusCode = 500;
    throw error;
  }
  const changedMovies = movies.map((movie) => {
    const percentageRating = Math.round((movie.originalRating / 5) * 100);
    const totalUser = movie.comments.length;
    return {
      ...movie._doc,
      ratingInPercentage: percentageRating,
      totalUser: totalUser,
    };
  });
  res.render("movies/index", {
    title: movieCategory,
    movies: changedMovies,
  });
};

exports.getSingleMovie = async (req, res, next) => {
  const movieId = req.params.movieId;
  const movieEditing = req.query.editing;
  const user = req.user;
  const errorMessage = req.flash("message");
  let singleMovie;
  try {
    singleMovie = await Movie.findById(movieId).populate("user");
  } catch (error) {
    return next(error);
  }
  if (!singleMovie) {
    const error = new Error("could not find single movie.");
    error.statusCode = 500;
    throw error;
  }
  const changedSingleMovie = {
    ...singleMovie._doc,
    originalRating: Math.round(singleMovie.originalRating),
    createdAt: singleMovie.createdAt.toDateString(),
  };
  const changedCommentsForDate = changedSingleMovie.comments.map((comment) => {
    return { ...comment._doc, time: comment.time.toDateString() };
  });
  let existingComment;
  if (req.user) {
    existingComment = changedSingleMovie.comments.find(
      (comment) => comment.userId.toString() === user._id.toString()
    );
  }
  res.render("movies/movie-description", {
    title: "Movie-Description",
    movie: changedSingleMovie,
    user: req.user,
    comments: changedCommentsForDate,
    existingComment: existingComment,
    editing: movieEditing,
    msg: errorMessage[0],
  });
};

exports.postAddComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!req.user) {
    return res.redirect("/admin/login");
  }
  const movieId = req.body.movieId;
  if (!errors.isEmpty()) {
    req.flash("message", "Comment and rating field should not be empty.");
    return res.redirect(`/movie/${movieId}`);
  }
  const comment = req.body.comment;
  const rating = +req.body.rating;
  const movie = await Movie.findById(movieId);
  if (!movie) {
    const error = new Error("could not find movie.");
    error.statusCode = 500;
    throw error;
  }
  if (movie.comments.length === 0) {
    movie.originalRating += rating;
  } else {
    let originalRating = movie.originalRating;
    const newOriginalRating = ((originalRating + rating) / 2).toFixed(2);
    movie.originalRating = newOriginalRating;
  }
  const movieComments = [...movie.comments];
  const newComment = {
    name: req.user.name,
    comment: comment,
    time: new Date(),
    rating: rating,
    userId: req.user._id,
  };
  movieComments.unshift(newComment);
  movie.comments = movieComments;
  await movie.save();
  res.redirect(`/movie/${movie._id}`);
};

exports.postUpdateComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!req.user) {
    return res.redirect("/admin/login");
  }
  const movieId = req.body.movieId;
  if (!errors.isEmpty()) {
    req.flash("message", "Comment and rating field should not be empty.");
    return res.redirect(`/movie/${movieId}?editing=true`);
  }
  const user = req.user;
  const comment = req.body.comment;
  const rating = +req.body.rating;
  let totalRating = 0;
  const movie = await Movie.findById(movieId);
  if (!movie) {
    const error = new Error("could not find movie.");
    error.statusCode = 500;
    throw error;
  }
  for (let comment of movie.comments) {
    totalRating += comment.rating;
  }
  const existingComment = movie.comments.find(
    (comment) => comment.userId.toString() === user._id.toString()
  );
  const newComment = {
    name: req.user.name,
    comment: comment,
    time: new Date(),
    rating: rating,
    userId: req.user._id,
  };
  let newCommentsArray;
  let newTotalRating;
  if (existingComment) {
    newCommentsArray = movie.comments.filter(
      (comment) =>
        comment.userId.toString() !== existingComment.userId.toString()
    );
    newTotalRating = totalRating - existingComment.rating + rating;
    newCommentsArray.unshift(newComment);
  }
  const newRating = newTotalRating / newCommentsArray.length;
  movie.originalRating = newRating;
  movie.comments = newCommentsArray;
  await movie.save();
  res.redirect(`/movie/${movie._id}`);
};

exports.postDeleteComment = async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/admin/login");
  }
  const movieId = req.body.movieId;
  const commentId = req.body.commentId;
  const rating = req.body.rating;
  let totalRating = 0;
  let newOriginalRating;
  const movie = await Movie.findById(movieId);
  if (!movie) {
    const error = new Error("could not find movie.");
    error.statusCode = 500;
    throw error;
  }
  for (let comment of movie.comments) {
    totalRating += comment.rating;
  }
  const newTotalRating = totalRating - rating;
  const newCommentsArray = movie.comments.filter(
    (comment) => comment._id.toString() !== commentId.toString()
  );
  if (newCommentsArray.length > 0) {
    newOriginalRating = newTotalRating / newCommentsArray.length;
  } else {
    newOriginalRating = newTotalRating;
  }
  movie.originalRating = newOriginalRating;
  movie.comments = newCommentsArray;
  await movie.save();
  res.status(200).json({
    message: "Comment deleted successfully.",
  });
};

exports.postAddMovies = async (req, res, next) => {
  const errors = validationResult(req);
  if (!req.user) {
    return res.redirect("/admin/login");
  }
  const imageUrl = req.file;
  if (!errors.isEmpty()) {
    if (imageUrl !== undefined) {
      utils.deleteImage(imageUrl.path);
    }
    return res.render("movies/add-movie", {
      msg: errors.array()[0].msg,
    });
  }
  if (imageUrl === undefined) {
    req.flash(
      "message",
      "Please choose an image which should be jpg, jpeg, png or webp."
    );
    return res.redirect("/add-movie");
  }
  const title = req.body.title;
  const description = req.body.description;
  const category = req.body.category;
  const userId = req.user._id;
  const movie = new Movie({
    title: title,
    imageUrl: req.uploadData.Location,
    imageName: req.uploadData.Key,
    description: description,
    originalRating: 0,
    user: userId,
    category: category,
    comments: [],
  });
  const savedMovie = await movie.save();
  const user = await User.findOne({ _id: userId });
  if (!user) {
    const error = new Error("Can't find the user from the database.");
    error.statusCode = 500;
    throw error;
  }
  user.movies.push({ movieId: savedMovie._id });
  await user.save();
  if (req.file) {
    utils.deleteImage(req.file.path);
  }
  res.redirect("/");
};

exports.adminMovies = async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/admin/login");
  }
  const userId = req.user._id;
  if (!userId) {
    return res.redirect("/admin/login");
  }
  const movies = await Movie.find({ user: userId });
  if (!movies) {
    const error = new Error("Movie cant find..server error");
    error.statusCode = 500;
    throw error;
  }
  res.render("movies/admin-movie", {
    title: "Admin-Movies",
    movies: movies,
  });
};

exports.postDeleteMovie = async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/admin/login");
  }
  const userId = req.user._id;
  const movieId = req.params.movieId;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    const error = new Error("Can't find the user from the database.");
    error.statusCode = 500;
    throw error;
  }
  const movies = [...user.movies];
  const updatedMovies = movies.filter(
    (movie) => movie.movieId.toString() !== movieId.toString()
  );
  user.movies = updatedMovies;
  await user.save();
  const movie = await Movie.findById(movieId);
  if (!movie) {
    const error = new Error("Can't find the movie from the database.");
    error.statusCode = 500;
    throw error;
  }
  const params = {
    Bucket: "test-bucket-5577",
    Key: movie.imageName,
  };
  s3.deleteObject(params, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  });
  await Movie.findByIdAndRemove(movieId);
  res.status(200).json({
    message: "movie deleted",
  });
};

exports.postSearchMovies = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(req.headers.referer);
  }
  const movieName = req.body.searchMovie.toLowerCase();
  const movies = await Movie.find({ title: movieName }).populate("user");
  if (!movies) {
    const error = new Error("Can't find the movie from the database.");
    error.statusCode = 500;
    throw error;
  }
  const changedMovies = movies.map((movie) => {
    const percentageRating = Math.round((movie.originalRating / 5) * 100);
    const totalUser = movie.comments.length;
    return {
      ...movie._doc,
      ratingInPercentage: percentageRating,
      totalUser: totalUser,
    };
  });
  res.render("movies/index", {
    movies: changedMovies,
  });
};
