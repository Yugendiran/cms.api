export class RoleMiddleware {
  static checkRole(role) {
    return (req, res, next) => {
      const loginRole = req.user.role;

      if (loginRole == "admin" && role == "admin") {
        next();
      } else if (loginRole == "user" && role == "user") {
        next();
      } else if (loginRole == "vendor" && role == "vendor") {
        next();
      } else {
        res.json({
          success: false,
          message: "Unauthorized access",
        });
      }
    };
  }
}
