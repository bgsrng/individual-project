const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT;

const { sequelize } = require("./lib/sequelize");

sequelize.sync({ alter: true });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Individual Project</h1>");
});
const {
  authRoutes,
  postRoutes,
  commentRoutes,
  userRoutes,
} = require("./routes");
app.use("/post_images", express.static(`${__dirname}/public/posts`));
app.use(
  "/profile_images",
  express.static(`${__dirname}/public/profile-picture`)
);

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log("Listening in port", PORT);
});
