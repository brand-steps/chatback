const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const app = express();
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET || "topsecret";
const cookieParser = require("cookie-parser")
require("dotenv").config();

app.use(express.json());

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors({origin: true, credentials: true}));

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("List it Application ");
});

app.use("/api/v1", (req, res, next) => {
  console.log("req.cookies: ", req.cookies.Token);

  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credentials with every request",
    });
    return;
  }

  jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
    if (!err) {
      console.log("decodedData: ", decodedData);

      const nowDate = new Date().getTime() / 1000;

      if (decodedData.exp < nowDate) {
        res.status(401);
        res.cookie("Token", "", {
          maxAge: 1,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.send({ message: "token expired" });
      } else {
        console.log("token approved");

        req.body.token = decodedData;
        next();
      }
    } else {
      res.status(401).send("invalid token");
    }
  });
});

app.get("/api/v1/listerprofile", (req, res) => {
  const _id = req.body.token._id;
  const getData = async () => {
    try {
      const user = await User.findOne(
        { _id: _id },
        "email password firstname lastname phone _id packagename"
      ).exec();
      if (!user) {
        res.status(404).send({});
        return;
      } else {
        res.set({
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        });
        res.status(200).send(user);
      }
    } catch (error) {
      console.log("error: ", error);
      res.status(500).send({
        message: "something went wrong on server",
      });
    }
  };
  getData();
});

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

