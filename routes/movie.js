const express = require("express");
const { body } = require("express-validator");

const movieController = require("../controllers/movie");
const util = require("../utils/is-auth");

const router = express.Router();

router.get("/", movieController.getMovies);
router.get("/movie/:movieId", movieController.getSingleMovie);
router.get("/movies/:movieCategory", movieController.getMovieByCategory);
router.get("/admin-movies", util.isAuth, movieController.adminMovies);
router.get("/add-movie", util.isAuth, movieController.getAddMovie);
router.get("/add-movie/:movieId", util.isAuth, movieController.getEditMovie);
router.post(
  "/add-movie",
  util.isAuth,
  [
    body("title")
      .not()
      .isEmpty()
      .withMessage("Title should not be empty")
      .isLength({ min: 3 })
      .withMessage("Title" + " should have atleast 3 character long."),
    body(
      "description",
      "Description should not be empty and atleast 3 character long."
    )
      .not()
      .isEmpty()
      .isLength({ min: 3 }),
  ],
  movieController.addMovies
);
router.post(
  "/edit-movie",
  util.isAuth,
  [
    body("title")
      .not()
      .isEmpty()
      .withMessage("Title should not be empty")
      .isLength({ min: 3 })
      .withMessage("Title" + " should have atleast 3 character long."),
    body(
      "description",
      "Description should not be empty and atleast 3 character long."
    )
      .not()
      .isEmpty()
      .isLength({ min: 3 }),
  ],
  movieController.postEditMovie
);
router.post("/add-comment", movieController.postAddComment);
router.post("/update-comment", movieController.postUpdateComment);
router.delete("/delete/:movieId", util.isAuth, movieController.postDeleteMovie);

module.exports = router;
