const { Comment, User } = require("../../lib/sequelize");
const Service = require("../service");

class CommentService extends Service {
  static getCommentByPostId = async ({
    _limit = 30,
    _page = 1,
    _sortBy = "",
    _sortDir = "",
    postId,
  }) => {
    try {
      const findCommentByPostId = await Comment.findAndCountAll({
        where: {
          post_id: postId,
        },
        limit: _limit ? parseInt(_limit) : undefined,
        offset: (_page - 1) * _limit,
        include: User,
        distinct: true,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
      });

      return this.handleSuccess({
        message: "Find Comment",
        statusCode: 200,
        data: findCommentByPostId,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static createComment = async ({ comment_content, post_id, token }) => {
    try {
      const newComment = await Comment.create({
        comment_content,
        user_id: token.id,
        post_id,
      });

      const user = await newComment.getUser();

      newComment.dataValues.User = user.dataValues;

      return this.handleSuccess({
        message: "Success Comment this post",
        statusCode: 201,
        data: newComment,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
}

module.exports = CommentService;
