const bcrypt = require("bcryptjs");

const User = require("../model/user");

exports.getSignUp = (req, res, next) => {
  const message = req.flash("message")[0];
  res.render("users/signup", {
    errorMessage: message,
  });
};

exports.postSignUp = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 12);
  const takenUser = await User.findOne({ email: email });
  if (takenUser) {
    req.flash("message", "Email address already exists");
    // console.log(req.flash("message"));
    return res.redirect("/admin/signup");
  }
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
  res.render("users/login");
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({ email: email });
  if (!user) {
    return console.log("wrong email address");
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    return console.log("wrong password.");
  }
  req.session.user = { _id: user._id, email: user.email };
  req.session.isLoggedIn = true;
  res.redirect("/");
};

exports.getLogOut = (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(() => {
      res.redirect("/admin/login");
    });
  }
};
