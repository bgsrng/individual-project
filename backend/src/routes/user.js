const fileUploader = require("../lib/uploader");
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");
const UserService = require("../services/user");

const router = require("express").Router();

router.patch(
  "/",
  authorizedLoggedInUser,
  fileUploader({
    destinationFolder: "profile-picture",
    fileType: "image",
    prefix: "POST",
  }).single("profile_image_file"),
  async (req, res) => {
    try {
      const { username, fullname, bio } = req.body;
      const { token } = req;

      const serviceResult = await UserService.editUserProfile({
        username,
        fullname,
        bio,
        token,
      });

      if (!serviceResult.success) throw serviceResult;

      return res.status(serviceResult.statusCode || 201).json({
        message: serviceResult.message,
        result: serviceResult.data,
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        message: err.message,
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    const serviceResult = await UserService.getUserById(id);

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 201).json({
      message: serviceResult.message,
      result: serviceResult.data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.get("/user-post", async (req, res) => {
  try {
    const { id } = req.query;
    const serviceResult = await UserService.getUserPost({ id });

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 201).json({
      message: serviceResult.message,
      result: serviceResult.data,
    });
  } catch (err) {
    console.log(err);
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.get("/user-like", async (req, res) => {
  try {
    const { id } = req.query;
    const serviceResult = await UserService.getUserLike({ id });

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 201).json({
      message: serviceResult.message,
      result: serviceResult.data,
    });
  } catch (err) {
    console.log(err);
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

module.exports = router;
