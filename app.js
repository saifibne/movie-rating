require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const multer = require("multer");
const csrf = require("csurf");
const compression = require("compression");
const imageMin = require("imagemin");
const imageMinWebp = require("imagemin-webp");
const aws = require("aws-sdk");

const movieRoute = require("./routes/movie");
const userRoute = require("./routes/user");
const User = require("./model/user");
const errorController = require("./controllers/error");
const utils = require("./utils/utils");

const app = express();
const sessionStore = new MongoStore({
  url: ` mongodb+srv://saifibne:${process.env.MONGODB_PASSWORD}@cluster0.5up7i.mongodb.net/movie?retryWrites=true&w=majority`,
  collection: "sessions",
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});
aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const s3 = new aws.S3();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static(path.join(__dirname, "shared")));
app.use(
  "/build/images",
  express.static(path.join(__dirname, "build", "images"))
);
app.use(
  "/fontawesome",
  express.static(
    path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")
  )
);

app.use(compression());

app.use(
  multer({ storage: storage, fileFilter: fileFilter }).single("imageUrl")
);
app.use(async (req, res, next) => {
  if (req.file) {
    const imageFile = await imageMin([req.file.path], {
      destination: "build/images",
      plugins: [imageMinWebp()],
    });
    const image = imageFile[0];
    const imageNameArray = image.destinationPath.split("/");
    const imageName = imageNameArray[imageNameArray.length - 1];
    const params = {
      Bucket: "test-bucket-5577",
      Key: imageName,
      Body: image.data,
    };
    s3.upload(params, (error, data) => {
      if (error) {
        throw error;
      } else {
        req.uploadData = data;
        utils.deleteImage(image.destinationPath);
        next();
      }
    });
  } else {
    next();
  }
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "superSecret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);
app.use(flash());
app.use(csrf());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  const userId = req.session.user._id;
  User.findOne({ _id: userId })
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  if (!req.session) {
    return next();
  }
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals._csrf = req.csrfToken();
  next();
});

app.use(movieRoute);
app.use("/admin", userRoute);
app.use(errorController.getErrorPage);

app.use((error, req, res, next) => {
  if (error) {
    const message = error.message;
    const statusCode = error.statusCode || 500;
    res
      .status(404)
      .sendFile(path.join(__dirname, "views", "error", "404.html"));
  }
});

mongoose
  .connect(
    ` mongodb+srv://saifibne:${process.env.MONGODB_PASSWORD}@cluster0.5up7i.mongodb.net/movie?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((result) => {
    console.log("connected to database");
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
