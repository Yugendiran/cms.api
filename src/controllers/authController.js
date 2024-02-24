import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sqlString from "sqlstring";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import conn from "../../config/db.js";
import mailConfig from "../../config/email.js";

dayjs.extend(utc);

const generateToken = async (type, user) => {
  let generateAccessToken = (user) => {
    let accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
    });

    let accessTokenExp = dayjs()
      .utc()
      .add(24, "hour")
      .format("YYYY-MM-DD HH:mm:ss");

    return { accessToken, accessTokenExp };
  };

  let generateRefreshToken = (user) => {
    let refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });

    let refreshTokenExp = dayjs()
      .utc()
      .add(30, "day")
      .format("YYYY-MM-DD HH:mm:ss");

    return { refreshToken, refreshTokenExp };
  };

  return new Promise((resolve, reject) => {
    if (type == "ACCESS") {
      let { accessToken, accessTokenExp } = generateAccessToken(user);

      let query = sqlString.format(
        `INSERT INTO Token (userId, tokenType, token, expiresAt) VALUES (?, ?, ?, ?);`,
        [user.userId, "ACCESS", accessToken, accessTokenExp]
      );

      conn.query(query, (err, result) => {
        if (err) {
          reject({
            success: false,
            error: err,
            message: "Error inserting token into the database",
          });
        }

        resolve({ accessToken, accessTokenExp });
      });
    } else if (type == "REFRESH") {
      let { refreshToken, refreshTokenExp } = generateRefreshToken(user);

      let query = sqlString.format(
        `INSERT INTO Token (userId, tokenType, token, expiresAt) VALUES (?, ?, ?, ?);`,
        [user.userId, "REFRESH", refreshToken, refreshTokenExp]
      );

      conn.query(query, (err, result) => {
        if (err) {
          reject({
            success: false,
            error: err,
            message: "Error inserting token into the database",
          });
        }

        resolve({ refreshToken, refreshTokenExp });
      });
    } else {
      let { accessToken, accessTokenExp } = generateAccessToken(user);
      let { refreshToken, refreshTokenExp } = generateRefreshToken(user);

      let query = sqlString.format(
        `INSERT INTO Token (userId, tokenType, token, expiresAt) VALUES (?, ?, ?, ?), (?, ?, ?, ?);`,
        [
          user.userId,
          "ACCESS",
          accessToken,
          accessTokenExp,
          user.userId,
          "REFRESH",
          refreshToken,
          refreshTokenExp,
        ]
      );

      conn.query(query, (err, result) => {
        if (err) {
          reject({
            success: false,
            error: err,
            message: "Error inserting token into the database",
          });
        }

        resolve({ accessToken, accessTokenExp, refreshToken, refreshTokenExp });
      });
    }
  });
};

const validateEmail = async (email) => {
  var tester =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email) return false;

  var emailParts = email.split("@");

  if (emailParts.length !== 2) return false;

  var account = emailParts[0];
  var address = emailParts[1];

  if (account.length > 64) return false;
  else if (address.length > 255) return false;

  var domainParts = address.split(".");

  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  )
    return false;

  return tester.test(email);
};

const generateOtp = async () => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  return OTP;
};

export class AuthController {
  static async register(req, res) {
    const { name, email, password } = req.body;

    // Check if the name is empty
    if (!name) {
      return res.json({
        success: false,
        message: "Name is required",
      });
    }

    // Check if the email is empty
    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if the password is empty
    if (!password) {
      return res.json({
        success: false,
        message: "Password is required",
      });
    }

    // Check if the email is valid
    if (!(await validateEmail(email))) {
      return res.json({
        success: false,
        message: "Please enter valid email address",
      });
    }

    let query = sqlString.format(
      `SELECT COUNT(*) AS count 
        FROM User
          WHERE email = ?`,
      [email]
    );

    conn.query(query, async (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Error fetching user from the database",
        });
      }

      let OTP = await generateOtp();

      if (result[0].count == 0) {
        let otpObj = {
          sendTo: email,
          method: "email",
          code: OTP,
          action: "register",
          expAt: dayjs().utc().add(30, "minute").format("YYYY-MM-DD HH:mm:ss"),
        };

        let salt = await bcrypt.genSalt(12);

        let query =
          sqlString.format(
            "INSERT INTO User (name, email, password) VALUES (?, ?, ?);",
            [name, email, await bcrypt.hash(password, salt)]
          ) + sqlString.format(`INSERT INTO Otp SET ?`, [otpObj]);

        conn.query(query, (err, result) => {
          if (err) {
            console.log(err);

            return res.json({
              success: false,
              message: "Error registering user",
            });
          }

          const mailOptions = {
            from: mailConfig.from,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${OTP}. It will expire in 30 minutes.`,
          };

          mailConfig.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            }
          });

          return res.json({
            success: true,
            message: "User registered successfully",
          });
        });
      } else {
        return res.json({
          success: false,
          message: "User with this email already exists. Try another email",
        });
      }
    });
  }

  static async login(req, res) {
    const { method } = req.body;

    if (!method) {
      return res.json({
        success: false,
        message: "Method is required",
      });
    }

    if (method != "password" && method != "otp") {
      return res.json({
        success: false,
        message: "Invalid method",
      });
    }

    let credentials = req.body.credentials;

    if (!credentials.email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    if (method == "password") {
      if (!credentials.password) {
        return res.json({
          success: false,
          message: "Password is required",
        });
      }
    } else if (method == "otp") {
    } else {
      return res.json({
        success: false,
        message: "Invalid method",
      });
    }

    let query = sqlString.format(
      "SELECT * FROM User WHERE email = ? ORDER BY userId DESC LIMIT 1",
      [credentials.email]
    );

    conn.query(query, async (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Error fetching user from the database",
        });
      }

      if (result.length == 0) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }

      if (result[0].isVerified == 0) {
        return res.json({
          success: false,
          message: "User not verified",
        });
      }

      if (method == "password") {
        bcrypt.compare(
          credentials.password,
          result[0].password,
          async (err, result2) => {
            if (err) {
              console.log(err);

              return res.json({
                success: false,
                message: "Error comparing passwords",
              });
            }

            if (result2) {
              let {
                accessToken,
                accessTokenExp,
                refreshToken,
                refreshTokenExp,
              } = await generateToken("BOTH", {
                userId: result[0].userId,
                name: result[0].name,
                email: result[0].email,
              });

              return res.json({
                success: true,
                message: "User logged in successfully",
                accessToken,
                accessTokenExp,
                refreshToken,
                refreshTokenExp,
              });
            } else {
              return res.json({
                success: false,
                message: "Incorrect password",
              });
            }
          }
        );
      } else if (method == "otp") {
        let OTP = await generateOtp();

        let otpObj = {
          sendTo: credentials.email,
          method: "email",
          code: OTP,
          action: "login",
          expAt: dayjs().utc().add(30, "minute").format("YYYY-MM-DD HH:mm:ss"),
        };

        let query = sqlString.format(`INSERT INTO Otp SET ?`, [otpObj]);

        conn.query(query, (err, result) => {
          if (err) {
            console.log(err);

            return res.json({
              success: false,
              message: "Error inserting otp into the database",
            });
          }

          const mailOptions = {
            from: mailConfig.from,
            to: credentials.email,
            subject: "OTP Verification",
            text: `Your OTP is ${OTP}. It will expire in 30 minutes.`,
          };

          mailConfig.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            }
          });

          return res.json({
            success: true,
            message: "OTP sent successfully",
          });
        });
      }
    });
  }

  static async refreshToken(req, res) {
    const refreshToken = req.body.refreshToken;

    if (refreshToken == null) {
      return res.json({
        success: false,
        message: "No token provided",
        login: false,
      });
    }

    let decodedToken = jwt.decode(refreshToken);

    let query = sqlString.format(
      `SELECT * FROM Token WHERE userId = ? AND tokenType = ? AND token = ? AND expiresAt > TIMESTAMP(?) ORDER BY tokenId DESC LIMIT 1`,
      [
        decodedToken.userId,
        "REFRESH",
        refreshToken,
        dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      ]
    );

    conn.query(query, (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: "Error fetching token from the database",
          login: false,
        });
      }

      if (result.length == 0) {
        return res.json({
          success: false,
          message: "Invalid token",
          login: false,
        });
      }

      let token = result[0];

      if (
        dayjs(dayjs().utc().format("YYYY-MM-DD HH:mm:ss")).isAfter(
          token.expiresAt
        )
      ) {
        return res.json({
          success: false,
          message: "Token expired",
          login: false,
        });
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, user) => {
          if (err) {
            return res.json({
              success: false,
              message: "Invalid token",
              login: false,
            });
          }

          let { accessToken, accessTokenExp, refreshToken, refreshTokenExp } =
            await generateToken("BOTH", {
              userId: decodedToken.userId,
              name: decodedToken.name,
              email: decodedToken.email,
            });

          return res.json({
            success: true,
            message: "Token refreshed successfully",
            userId: decodedToken.userId,
            accessToken,
            accessTokenExp,
            refreshToken,
            refreshTokenExp,
          });
        }
      );
    });
  }

  static async validateOtp(req, res) {
    let { email, code, action } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    if (!code) {
      return res.json({
        success: false,
        message: "Code is required",
      });
    }

    if (!action) {
      return res.json({
        success: false,
        message: "Action is required",
      });
    }

    if (!(await validateEmail(email))) {
      return res.json({
        success: false,
        message: "Please enter valid email address",
      });
    }

    if (
      action != "register" &&
      action != "login" &&
      action != "forgot-password"
    ) {
      return res.json({
        success: false,
        message: "Invalid action",
      });
    }

    let checkUserQuery = sqlString.format(
      "SELECT * FROM User WHERE email = ? ORDER BY userId DESC LIMIT 1",
      [email]
    );

    conn.query(checkUserQuery, (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      if (result.length == 0) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }

      const user = result[0];

      let query = sqlString.format(
        "SELECT * FROM Otp WHERE `sendTo` = ? AND code = ? AND action = ? ORDER BY otpId DESC LIMIT 1",
        [email, code, action]
      );

      conn.query(query, (err, result) => {
        if (err) {
          console.log(err);

          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        if (result.length > 0) {
          let otp = result[0];

          if (otp.status == "used") {
            return res.json({
              success: false,
              message: "This otp has been already used.",
            });
          }

          if (otp.status == "expired") {
            return res.json({
              success: false,
              message: "OTP expired",
            });
          }

          if (
            dayjs(dayjs().utc().format("YYYY-MM-DD HH:mm:ss")).isAfter(
              otp.expAt
            )
          ) {
            let query = sqlString.format(
              "UPDATE Otp SET status = 'expired' WHERE otpId = ?;",
              [otp.otpId]
            );

            conn.query(query, (err, result) => {
              if (err) {
                console.log(err);

                return res.json({
                  success: false,
                  message: "Something went wrong",
                });
              }

              return res.json({
                success: false,
                message: "OTP expired",
              });
            });

            return;
          } else {
            if (action == "register" && user.isVerified == 0) {
              let query =
                sqlString.format(
                  "UPDATE Otp SET status = 'used' WHERE otpId = ?;",
                  [otp.otpId]
                ) +
                sqlString.format(
                  "UPDATE User SET isVerified = 1 WHERE email = ?;",
                  [email]
                );

              conn.query(query, async (err, result) => {
                if (err) {
                  console.log(err);

                  return res.json({
                    success: false,
                    message: "Something went wrong",
                  });
                }

                let {
                  accessToken,
                  accessTokenExp,
                  refreshToken,
                  refreshTokenExp,
                } = await generateToken("BOTH", {
                  userId: user.userId,
                  name: user.name,
                  email: user.email,
                });

                return res.json({
                  success: true,
                  message: "Otp verified successfully",
                  accessToken,
                  accessTokenExp,
                  refreshToken,
                  refreshTokenExp,
                });
              });
            } else if (action == "login" && user.isVerified == 1) {
              let query = sqlString.format(
                "UPDATE Otp SET status = 'used' WHERE otpId = ?;",
                [otp.otpId]
              );

              conn.query(query, async (err, result) => {
                if (err) {
                  console.log(err);

                  return res.json({
                    success: false,
                    message: "Something went wrong",
                  });
                }

                let {
                  accessToken,
                  accessTokenExp,
                  refreshToken,
                  refreshTokenExp,
                } = await generateToken("BOTH", {
                  userId: user.userId,
                  name: user.name,
                  email: user.email,
                });

                return res.json({
                  success: true,
                  message: "Otp verified successfully",
                  accessToken,
                  accessTokenExp,
                  refreshToken,
                  refreshTokenExp,
                });
              });
            } else if (action == "register" && user.isVerified == 1) {
              let query = sqlString.format(
                "UPDATE Otp SET status = 'used' WHERE otpId = ?;",
                [otp.otpId]
              );

              conn.query(query, async (err, result) => {
                if (err) {
                  console.log(err);

                  return res.json({
                    success: false,
                    message: "Something went wrong",
                  });
                }

                let {
                  accessToken,
                  accessTokenExp,
                  refreshToken,
                  refreshTokenExp,
                } = await generateToken("BOTH", {
                  userId: user.userId,
                  name: user.name,
                  email: user.email,
                });

                return res.json({
                  success: true,
                  message: "Otp verified successfully",
                  accessToken,
                  accessTokenExp,
                  refreshToken,
                  refreshTokenExp,
                });
              });
            } else if (action == "login" && user.isVerified == 0) {
              return res.json({
                success: false,
                message: "User not verified",
              });
            } else if (action == "forgot-password") {
              let query = sqlString.format(
                "UPDATE Otp SET status = 'used' WHERE otpId = ?;",
                [otp.otpId]
              );

              conn.query(query, async (err, result) => {
                if (err) {
                  console.log(err);

                  return res.json({
                    success: false,
                    message: "Something went wrong",
                  });
                }

                let {
                  accessToken,
                  accessTokenExp,
                  refreshToken,
                  refreshTokenExp,
                } = await generateToken("BOTH", {
                  userId: user.userId,
                  name: user.name,
                  email: user.email,
                });

                return res.json({
                  success: true,
                  message: "Otp verified successfully",
                  accessToken,
                  accessTokenExp,
                  refreshToken,
                  refreshTokenExp,
                });
              });
            }
          }
        } else {
          return res.json({
            success: false,
            message: "Invalid OTP",
          });
        }
      });
    });
  }

  static async resendOtp(req, res) {
    let { email, action } = req.body;

    if (email) {
      if (!(await validateEmail(email))) {
        return res.json({
          success: false,
          message: "Please enter valid email address",
        });
      }

      let OTP = await generateOtp();

      let otpObj = {
        sendTo: email,
        method: "email",
        code: OTP,
        action: action,
        expAt: dayjs().utc().add(30, "minute").format("YYYY-MM-DD HH:mm:ss"),
      };

      let checkUserQuery = sqlString.format(
        "SELECT * FROM User WHERE email = ? ORDER BY userId DESC LIMIT 1",
        [email]
      );

      conn.query(checkUserQuery, (err, result) => {
        if (err) {
          console.log(err);

          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        if (result.length == 0) {
          return res.json({
            success: false,
            message: "User not found",
          });
        }

        if (action == "register") {
          if (result[0].isVerified == 1) {
            return res.json({
              success: false,
              message: "User already verified",
            });
          }
        }

        let query =
          sqlString.format(
            "UPDATE Otp SET status = 'expired' WHERE sendTo = ? AND action = ? AND status = 'pending';",
            [email, action]
          ) + sqlString.format("INSERT INTO Otp SET ?", [otpObj]);

        conn.query(query, (err, result) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          const mailOptions = {
            from: mailConfig.from,
            to: email,
            subject:
              action == "forgot-password"
                ? "Password Reset"
                : "OTP Verification",
            text: `Your OTP is ${OTP}. It will expire in 30 minutes.`,
          };

          mailConfig.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            }
          });

          return res.json({
            success: true,
            message: "OTP resent successfully",
          });
        });
      });
    } else {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }
  }

  static async forgotPassword(req, res) {
    let email = req.body.email;

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    if (!(await validateEmail(email))) {
      return res.json({
        success: false,
        message: "Please enter valid email address",
      });
    }

    let query = sqlString.format(
      "SELECT COUNT(*) AS count FROM User WHERE email = ? ORDER BY userId DESC LIMIT 1",
      [email]
    );

    conn.query(query, async (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      if (result[0].count == 0) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }

      let OTP = await generateOtp();

      let otpObj = {
        sendTo: email,
        method: "email",
        code: OTP,
        action: "forgot-password",
        expAt: dayjs().utc().add(10, "minute").format("YYYY-MM-DD HH:mm:ss"),
      };

      let query = sqlString.format("INSERT INTO Otp SET ?", [otpObj]);

      conn.query(query, (err, result) => {
        if (err) {
          console.log(err);

          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        const mailOptions = {
          from: mailConfig.from,
          to: email,
          subject: "Password Reset",
          text: `Your OTP is ${OTP}. It will expire in 10 minutes.`,
        };

        mailConfig.transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          }
        });

        return res.json({
          success: true,
          message: "Otp sent successfully",
        });
      });
    });
  }

  static async resetPassword(req, res) {
    let userId = req.user.userId;
    let { password } = req.body;

    if (!password) {
      return res.json({
        success: false,
        message: "Password is required",
      });
    }

    let salt = await bcrypt.genSalt(12);

    let query = sqlString.format(
      "UPDATE User SET password = ? WHERE userId = ?;",
      [await bcrypt.hash(password, salt), userId]
    );

    conn.query(query, (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    });
  }
}
