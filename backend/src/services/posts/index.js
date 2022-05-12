const Service = require("../service");
const { Post, User, Like } = require("../../lib/sequelize");
const fs = require("fs");

class PostService extends Service {
  static getAllPosts = async ({
    _limit = 10,
    _page = 1,
    _sortBy = "",
    _sortDir = "",
    token,
  }) => {
    try {
      const findPosts = await Post.findAndCountAll({
        limit: _limit ? parseInt(_limit) : undefined,
        offset: (_page - 1) * _limit,
        include: [
          {
            model: User,
            as: "user_posts",
          },
          {
            model: User,
            as: "user_likes",
            where: {
              id: token.id,
            },
            required: false,
          },
        ],
        distinct: true,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
      });

      return this.handleSuccess({
        message: "Find all posts",
        data: findPosts,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static getPostById = async ({ postId, token }) => {
    try {
      const findPost = await Post.findOne({
        where: {
          id: postId,
        },
        include: [
          {
            model: User,
            as: "user_posts",
          },
          {
            model: User,
            as: "user_likes",
            where: {
              id: token.id,
            },
            required: false,
          },
        ],
      });
      if (!findPost) {
        return this.handleError({
          message: "No posts found",
          statusCode: 400,
        });
      }
      return this.handleSuccess({
        message: "Find post by id",
        data: findPost,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static createNewPost = async ({ caption, location, token, filename }) => {
    try {
      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = "post_images";

      const newPost = await Post.create({
        image_url: `${uploadFileDomain}/${filePath}/${filename}`,
        caption,
        location,
        user_id: token.id,
      });

      return this.handleSuccess({
        message: "Post Created",
        statusCode: 201,
        data: newPost,
      });
    } catch (err) {
      console.log(err);
      fs.unlinkSync(__dirname + "/../public/posts/" + filename);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static deletePostById = async ({ id }) => {
    try {
      await Post.destroy({
        where: {
          id,
        },
      });
      return this.handleSuccess({
        message: "Deleted Success",
        statusCode: 200,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static editPostById = async ({ caption, id }) => {
    try {
      const findPost = await Post.findByPk(id);

      if (!findPost) {
        return this.handleError({
          message: "Post Not Found",
          statusCode: 400,
        });
      }

      await Post.update(
        { caption },
        {
          where: {
            id,
          },
        }
      );

      return this.handleSuccess({
        message: "Edited Post",
        statusCode: 200,
      });
    } catch (err) {
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static addPostLikes = async ({ postId, userId }) => {
    try {
      const findUserLike = await Like.findOne({
        where: {
          post_id: postId,
          user_id: userId,
        },
      });

      if (findUserLike) {
        return this.handleError({
          message: "user already like this post",
        });
      }

      await Like.create({
        post_id: postId,
        user_id: userId,
      });

      const postLiked = await Post.findOne({
        where: {
          id: postId,
        },
      });

      await postLiked.increment("like_count", { by: 1 });

      return this.handleSuccess({
        message: "Success Likes",
      });
    } catch (err) {
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static removePostLikes = async ({ postId, userId }) => {
    try {
      await Like.destroy({
        where: {
          post_id: postId,
          user_id: userId,
        },
      });

      const postLiked = await Post.findOne({
        where: {
          id: postId,
        },
      });

      await postLiked.decrement("like_count", { by: 1 });

      return this.handleSuccess({ message: "Success unliked" });
    } catch (err) {
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
}

module.exports = PostService;
