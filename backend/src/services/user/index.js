const fs = require("fs");
const { User, Post, Like } = require("../../lib/sequelize");
const Service = require("../service");

class UserService extends Service {
  static editUserProfile = async ({ username, fullname, bio, token }) => {
    try {
      if (username) {
        const findUser = await User.findOne({ where: { username } });
        if (findUser) {
          return this.handleError({
            message: "Username already taken",
            statusCode: 400,
          });
        }
      }
      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = "profile_images";
      const filename = req.file?.filename;

      await User.update(
        {
          username,
          profile_picture: file
            ? `${uploadFileDomain}/${filePath}/${filename}`
            : undefined,
          fullname,
          bio,
        },
        {
          where: { id: token.id },
        }
      );

      const newDataUser = await User.findByPk(token.id);

      return this.handleSuccess({
        message: "Edited Post",
        statusCode: 200,
        data: newDataUser,
      });
    } catch (err) {
      console.log(err);
      fs.unlinkSync(
        __dirname + "/../public/profile-picture/" + req.file.filename
      );
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static getUserById = async (id) => {
    try {
      const data = await User.findByPk(id);

      if (!data) {
        return this.handleError({
          message: "User Not Found",
          statusCode: 400,
        });
      }

      return this.handleSuccess({
        message: "User Found",
        statusCode: 200,
        data: data,
      });
    } catch (err) {
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static getUserPost = async ({ id }) => {
    try {
      const findUserPost = await Post.findAll({
        where: {
          user_id: id,
        },
      });

      if (!findUserPost.length) {
        return this.handleError({
          message: "No posts found",
          statusCode: 400,
        });
      }

      return this.handleSuccess({
        message: "Find all user post",
        data: findUserPost,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static getUserLike = async ({ id }) => {
    try {
      const findUserLike = await Like.findAll({
        where: {
          user_id: id,
        },
        include: Post,
      });

      if (!findUserLike.length) {
        return this.handleError({
          message: "User like post not found",
          statusCode: 400,
        });
      }

      return this.handleSuccess({
        message: "Find all user like",
        data: findUserLike,
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

module.exports = UserService;
