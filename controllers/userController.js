const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET || "topsecret";

module.exports.login = async (req, res, next) => {
  try {
    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.email || !body.password) {
      res.status(400).send(`required fields missing, request example: ...`);
      return;
    }

    // check if user exists
    const data = await User.findOne(
      { email: body.email },
      "username email password"
    );

    if (data && body.password === data.password) {
      // user found
      console.log("User Successfully Logged In !");
      console.log("data: ", data);

      const token = jwt.sign(
        {
          _id: data._id,
          email: data.email,
          iat: Math.floor(Date.now() / 1000) - 30,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        },
        SECRET
      );

      console.log("token: ", token);

      res.cookie("Token", token, {
        maxAge: 86_400_000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.send({
        message: "login successful",
        profile: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          _id: data._id,
        },
      });

      return;
    } else {
      // user not found
      console.log("user not found");
      res.status(401).send({ message: "Incorrect email or password" });
    }
  } catch (error) {
    console.log("error: ", error);
    res.status(500).send({ message: "login failed, please try later" });
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { firstname, lastname, email, phone ,postal,address,city,state, password } = req.body;

    // Check if user with the given email already exists
    const existingCustomer = await User.findOne({ email });

    if (existingCustomer) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create a new user
    const newCustomer = new User({
      firstname,
      lastname,
      email,
      phone,
      postal,
      address,
      city,
      state,
      password,
    });

    // Save the user to the database
    await newCustomer.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    // await User.find({ _id: { $ne: req.params.id } }).select([
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

