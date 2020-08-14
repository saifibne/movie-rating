const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../model/user");

exports.getSignUp = (req, res, next) => {
  const message = req.flash("message")[0];
  res.render("users/signup", {
    title: "Sign-Up",
    errorMessage: message,
  });
};

exports.postSignUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("users/signup", {
      msg: errors.array()[0].msg,
    });
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    name: name,
    email: email,
    password: hashedPassword,
    movies: [],
  });
  const createdUser = await user.save();
  res.redirect("/admin/login");
};

exports.getLogin = (req, res, next) => {
  const flashMessage = req.flash("message");
  res.render("users/login", {
    title: "Login",
    flashMessage: flashMessage[0],
  });
};

exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("users/login", {
      msg: errors.array()[0].msg,
    });
  }
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({ email: email });
  if (!user) {
    req.flash("message", "You entered wrong email address.");
    return res.redirect("/admin/login");
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    req.flash("message", "Your password is incorrect.");
    return res.redirect("/admin/login");
  }
  req.session.user = { _id: user._id, email: user.email };
  req.session.isLoggedIn = true;
  req.session.save((err) => {
    res.redirect("/");
  });
};

exports.getLogOut = (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  }
};
