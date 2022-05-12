const { Sequelize } = require("sequelize");
const mysqlConfig = require("../configs/database");

const sequelize = new Sequelize({
  username: mysqlConfig.MYSQL_USERNAME,
  password: mysqlConfig.MYSQL_PASSWORD,
  database: mysqlConfig.MYSQL_DB_NAME,
  port: 3306,
  dialect: "mysql",
  logging: false,
});

// models
const Post = require("../models/post")(sequelize);
const User = require("../models/user")(sequelize);
const Like = require("../models/like")(sequelize);
const Comment = require("../models/comment")(sequelize);
const VerificationToken = require("../models/verification_token")(sequelize);
const ForgotPasswordToken = require("../models/forgot_password_token")(
  sequelize
);

// 1:M post and user
Post.belongsTo(User, {
  foreignKey: "user_id",
  as: "user_posts",
  onDelete: "CASCADE",
});
User.hasMany(Post, {
  foreignKey: "user_id",
  as: "user_posts",
  onDelete: "CASCADE",
});

// 1:M verification and user
VerificationToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(VerificationToken, { foreignKey: "user_id" });

// M:M post and user
Post.belongsToMany(User, {
  through: Like,
  foreignKey: "post_id",
  as: "user_likes",
});
User.belongsToMany(Post, {
  through: Like,
  foreignKey: "user_id",
  as: "user_likes",
});
User.hasMany(Like, { foreignKey: "user_id" });
Like.belongsTo(User, { foreignKey: "user_id" });
Post.hasMany(Like, { foreignKey: "post_id", onDelete: "CASCADE" });
Like.belongsTo(Post, { foreignKey: "post_id", onDelete: "CASCADE" });

// 1:M post and comment
Comment.belongsTo(Post, { foreignKey: "post_id", onDelete: "CASCADE" });
Post.hasMany(Comment, { foreignKey: "post_id", onDelete: "CASCADE" });

// 1:M user and comment
Comment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Comment, { foreignKey: "user_id" });

// 1:M User and Forget Password Token
ForgotPasswordToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(ForgotPasswordToken, { foreignKey: "user_id" });

module.exports = {
  sequelize,
  Post,
  User,
  Like,
  Comment,
  VerificationToken,
  ForgotPasswordToken,
};
