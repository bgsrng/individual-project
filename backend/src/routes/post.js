const PostService = require("../services/posts");
const fileUploader = require("../lib/uploader");
const router = require("express").Router();
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");

router.get("/", authorizedLoggedInUser, async (req, res) => {
  try {
    const { _limit, _page, _sortBy, _sortDir } = req.query;
    const { token } = req;
    const serviceResult = await PostService.getAllPosts({
      _limit,
      _page,
      _sortBy,
      _sortDir,
      token,
    });

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 200).json({
      message: serviceResult.message,
      result: serviceResult.data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.get("/:postId", authorizedLoggedInUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const { token } = req;
    const serviceResult = await PostService.getPostById({ postId, token });

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 200).json({
      message: serviceResult.message,
      result: serviceResult.data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.post(
  "/",
  authorizedLoggedInUser,
  fileUploader({
    destinationFolder: "posts",
    fileType: "image",
    prefix: "POST",
  }).single("post_image_file"),
  async (req, res) => {
    try {
      const { caption, location } = req.body;
      const { token } = req;
      const { filename } = req.file;

      const serviceResult = await PostService.createNewPost({
        caption,
        location,
        token,
        filename,
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const serviceResult = await PostService.deletePostById({ id });

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 200).json({
      message: serviceResult.message,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { caption } = req.body;
    const { id } = req.params;
    const serviceResult = await PostService.editPostById({
      caption,
      id,
    });

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 200).json({
      message: serviceResult.message,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.post("/:postId/likes/:userId", async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const serviceResult = await PostService.addPostLikes({
      postId,
      userId,
    });
    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 201).json({
      message: serviceResult.message,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.delete("/:postId/likes/:userId", async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const serviceResult = await PostService.removePostLikes({
      postId,
      userId,
    });
    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 201).json({
      message: serviceResult.message,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

module.exports = router;
