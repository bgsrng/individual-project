const Service = require("../service");
const {
  User,
  VerificationToken,
  ForgotPasswordToken,
} = require("../../lib/sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../lib/jwt");
const fs = require("fs");
const { nanoid } = require("nanoid");
const moment = require("moment");
const mustache = require("mustache");
const mailer = require("../../lib/mailer");

class authService extends Service {
  static register = async ({ username, email, password }) => {
    try {
      const isUsernameEmailTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (isUsernameEmailTaken) {
        return this.handleError({
          message: "Username and Email has been taken",
          statusCode: 400,
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      const verificationToken = nanoid(40);

      await VerificationToken.create({
        token: verificationToken,
        user_id: newUser.id,
        valid_until: moment().add(1, "hour"),
        is_valid: true,
      });

      const verificationLink = `${process.env.HOST_VERIFICATION}/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username,
        verify_url: verificationLink,
      });

      await mailer({
        to: email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

      return this.handleSuccess({
        message: "Registered User",
        statusCode: 201,
        data: newUser,
      });
    } catch (err) {
      console.log(err);

      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static login = async ({ username, password }) => {
    try {
      const findUser = await User.findOne({
        where: {
          [Op.or]: [{ username }],
        },
      });

      if (!findUser) {
        return this.handleError({
          message: "Wrong username or password",
          statusCode: 400,
        });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, findUser.password);

      if (!isPasswordCorrect) {
        return this.handleError({
          message: "wrong username or password",
          statusCode: 400,
        });
      }

      delete findUser.dataValues.password;

      const token = generateToken({
        id: findUser.id,
        role: findUser.role,
      });

      return this.handleSuccess({
        message: "Logged in user",
        statusCode: 200,
        data: {
          user: findUser,
          token,
        },
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static keepLogin = async ({ token }) => {
    try {
      const renewedToken = generateToken({ id: token.id });

      const findUser = await User.findByPk(token.id);

      if (!findUser) {
        return this.handleError({
          message: "User not found",
          statusCode: 400,
        });
      }
      delete findUser.dataValues.password;

      return this.handleSuccess({
        message: "Renewed user token",
        statusCode: 200,
        data: {
          user: findUser,
          token: renewedToken,
        },
      });
    } catch (err) {
      console.log(err);

      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static verifyUser = async ({ token }) => {
    try {
      const findToken = await VerificationToken.findOne({
        where: {
          token,
          is_valid: true,
          valid_until: {
            [Op.gt]: moment().utc(),
          },
        },
      });

      if (!findToken) {
        return this.handleError({
          message: "Your token is invalid",
          statusCode: 400,
        });
      }

      await User.update(
        { is_verified: true },
        {
          where: {
            id: findToken.user_id,
          },
        }
      );

      findToken.is_valid = false;
      findToken.save();

      return this.handleRedirect({
        link: `http://localhost:3000/verification_page`,
      });
    } catch (err) {
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static resendVerificationEmail = async ({ id }) => {
    try {
      await VerificationToken.update(
        { is_valid: false },
        {
          where: {
            is_valid: true,
            user_id: id,
          },
        }
      );

      const verificationToken = nanoid(40);

      await VerificationToken.create({
        token: verificationToken,
        is_valid: true,
        user_id: id,
        valid_until: moment().add(1, "hour"),
      });

      const findUser = await User.findByPk(id);

      const verificationLink = `http://localhost:2000/auth/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username: findUser.username,
        verify_url: verificationLink,
      });

      await mailer({
        to: findUser.email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

      return this.handleSuccess({
        message: "Resent verification email",
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

module.exports = authService;
