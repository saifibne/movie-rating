const { validationResult } = require("express-validator");

const User = require("../model/user");
const Movie = require("../model/movie");
const utils = require("../utils/utils");

exports.getMovies = async (req, res, next) => {
  const movies = await Movie.find().populate("user");
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
  res.render("movies/index", {
    movies: changedMovies,
  });
};

exports.getAddMovie = (req, res, next) => {
  const editing = req.query.editing;
  const flashMessage = req.flash("message");
  res.render("movies/add-movie", {
    editing: editing,
    flashMessage: flashMessage[0],
  });
};

exports.getEditMovie = async (req, res, next) => {
  const movieId = req.params.movieId;
  const editing = req.query.editing;
  const flashMessage = req.flash("message");
  const singleMovie = await Movie.findById(movieId);
  res.render("movies/add-movie", {
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
    updatedImageUrl = req.file.path;
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
  res.redirect("/admin-movies");
};

exports.getMovieByCategory = async (req, res, next) => {
  const movieCategory = req.params.movieCategory;
  const movies = await Movie.find({ category: movieCategory });
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
    movies: changedMovies,
  });
};

exports.getSingleMovie = async (req, res, next) => {
  const movieId = req.params.movieId;
  const movieEditing = req.query.editing;
  const user = req.user;
  const errorMessage = req.flash("message");
  const singleMovie = await Movie.findById(movieId).populate("user");
  if (!singleMovie) {
    const error = new Error("could not find single movie.");
    error.statusCode = 500;
    throw error;
  }
  const changedSingleMovie = {
    ...singleMovie._doc,
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
  const rating = 3;
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
  console.log(movie.originalRating);
  const movieComments = [...movie.comments];
  const newComment = {
    name: req.user.name,
    comment: comment,
    time: new Date(),
    rating: rating,
    userId: req.user._id,
  };
  movieComments.push(newComment);
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
  const rating = 3;
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
    newCommentsArray.push(newComment);
  }
  const newRating = newTotalRating / newCommentsArray.length;
  movie.originalRating = newRating;
  movie.comments = newCommentsArray;
  await movie.save();
  res.redirect(`/movie/${movie._id}`);
};

exports.addMovies = async (req, res, next) => {
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
    imageUrl: imageUrl.path,
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
  utils.deleteImage(movie.imageUrl);
  await Movie.findByIdAndRemove(movieId);
  res.status(200).json({
    message: "movie deleted",
  });
};
