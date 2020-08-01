const path = require("path");
const fs = require("fs");

exports.deleteImage = (filePath) => {
  const pathConstruct = path.join(__dirname, "..", filePath);
  fs.unlink(pathConstruct, (err) => {
    console.log(err);
  });
};
