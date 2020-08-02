const express = require("express");
const { body } = require("express-validator");

const userController = require("../controllers/user");
const util = require("../utils/is-auth");
const User = require("../model/user");

const router = express.Router();

router.get("/login", userController.getLogin);
router.get("/signup", userController.getSignUp);
router.get("/logout", util.isAuth, userController.getLogOut);
router.post(
  "/signup",
  [
    body("name", "Name field should not be empty.").not().isEmpty(),
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email field should not be empty")
      .isEmail()
      .withMessage("It is not valid email address")
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email address already exists.");
          }
        });
      }),
    body(
      "password",
      "Password field should not be empty and should have at least 6 character long."
    )
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
    body("confirmPassword", "Confirm password field should not be empty.")
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Confirm password does not match password");
        }
        return true;
      }),
  ],
  userController.postSignUp
);
router.post(
  "/login",
  [
    body("email", "Email field should not be empty.").not().isEmpty(),
    body("password", "Password field should not be empty.").not().isEmpty(),
  ],
  userController.postLogin
);

module.exports = router;
