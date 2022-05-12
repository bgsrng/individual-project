const { DataTypes } = require("sequelize");

const Comment = (sequelize) => {
  return sequelize.define("Comment", {
    comment_content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

module.exports = Comment;
