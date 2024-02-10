const mongoose = require("mongoose");

const listerschema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  phone: String,
  postal: String,
  address: String,
  city: String,
  state: String,
  packagename: String,
  password: String,
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Users", listerschema);
