const {
  login,
  register,
  getAllUsers,
} = require("../controllers/userController");
const cookieParser = require("cookie-parser")

const router = require("express").Router();

router.use(cookieParser());

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);

module.exports = router;
