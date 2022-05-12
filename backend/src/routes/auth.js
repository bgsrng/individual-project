const _ = require("lodash");
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");
const authService = require("../services/auth");
const router = require("express").Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const serviceResult = await authService.login({
      username,
      password,
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

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const serviceResult = await authService.register({
      username,
      email,
      password,
    });

    if (!_.get(serviceResult, "success")) throw serviceResult;

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

router.get("/refresh-token", authorizedLoggedInUser, async (req, res) => {
  try {
    const { token } = req;
    const serviceResult = await authService.keepLogin({
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

router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const serviceResult = await authService.verifyUser({ token });

    if (!serviceResult.success) throw serviceResult;

    return res.redirect(serviceResult.link);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.post(
  "/resend-verification",
  authorizedLoggedInUser,
  async (req, res) => {
    try {
      const { id } = req.token;
      const serviceResult = await authService.resendVerificationEmail({ id });

      if (!serviceResult.success) throw serviceResult;

      return res.status(serviceResult.statusCode || 201).json({
        message: serviceResult.message,
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        message: err.message,
      });
    }
  }
);

module.exports = router;
