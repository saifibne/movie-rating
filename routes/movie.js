const express = require("express");

const movieController = require("../controllers/movie");
const util = require("../utils/is-auth");

const router = express.Router();

router.get("/", movieController.getMovies);
router.get("/movie/:movieCategory", movieController.getMovieByCategory);
router.get("/admin-movies", util.isAuth, movieController.adminMovies);
router.get("/add-movie", util.isAuth, movieController.getAddMovie);
router.get("/add-movie/:movieId", util.isAuth, movieController.getEditMovie);
router.post("/add-movie", util.isAuth, movieController.addMovies);
router.post("/edit-movie", util.isAuth, movieController.postEditMovie);
router.delete("/delete/:movieId", util.isAuth, movieController.postDeleteMovie);

module.exports = router;
