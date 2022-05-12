const CommentService = require("../services/comment");
const router = require("express").Router();
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");

router.get("/:postId", async (req, res) => {
  try {
    const { _limit = 30, _page = 1, _sortBy = "", _sortDir = "" } = req.query;
    const { postId } = req.params;
    const serviceResult = await CommentService.getCommentByPostId({
      _limit,
      _page,
      _sortBy,
      _sortDir,
      postId,
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

router.post("/", authorizedLoggedInUser, async (req, res) => {
  try {
    const { comment_content, post_id } = req.body;
    const { token } = req;
    const serviceResult = await CommentService.createComment({
      comment_content,
      post_id,
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
});

module.exports = router;
