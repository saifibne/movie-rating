const express = require("express");

const userController = require("../controllers/user");
const util = require("../utils/is-auth");

const router = express.Router();

router.get("/login", userController.getLogin);
router.get("/signup", userController.getSignUp);
router.get("/logout", util.isAuth, userController.getLogOut);
router.post("/signup", userController.postSignUp);
router.post("/login", userController.postLogin);

module.exports = router;
