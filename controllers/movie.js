const User = require("../model/user");
const Movie = require("../model/movie");

exports.getMovies = (req, res, next) => {
  Movie.find()
    .populate("user")
    .then((movies) => {
      res.render("movies/index", {
        movies: movies,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddMovie = (req, res, next) => {
  const editing = req.query.editing;
  res.render("movies/add-movie", {
    editing: editing,
  });
};

exports.getEditMovie = async (req, res, next) => {
  const movieId = req.params.movieId;
  const editing = req.query.editing;
  const singleMovie = await Movie.findById(movieId);
  res.render("movies/add-movie", {
    editing: editing,
    movie: singleMovie,
  });
};

exports.postEditMovie = async (req, res, next) => {
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedCategory = req.body.category;
  const movieId = req.body.movieId;
  const movie = await Movie.findById(movieId);
  movie.title = updatedTitle;
  if (movie.imageUrl !== updatedImageUrl) {
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
  res.render("movies/index", {
    movies: movies,
  });
};

exports.addMovies = async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/admin/login");
  }
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const category = req.body.category;
  const userId = req.user._id;
  const movie = new Movie({
    title: title,
    imageUrl: imageUrl,
    description: description,
    originalRating: 0,
    ratingData: [],
    user: userId,
    category: category,
    comments: [],
  });
  const savedMovie = await movie.save();
  const user = await User.findOne({ _id: userId });
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
  const movies = [...user.movies];
  const updatedMovies = movies.filter(
    (movie) => movie.movieId.toString() !== movieId.toString()
  );
  user.movies = updatedMovies;
  await user.save();
  await Movie.findByIdAndRemove(movieId);
  res.status(200).json({
    message: "movie deleted",
  });
};
