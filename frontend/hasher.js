// hasher.js usando CommonJS
const bcrypt = require("bcryptjs");

bcrypt.hash("123456", 10).then((hash) => {
  console.log("HASH:", hash);
});
