export class UserController {
  static getUsers(req, res) {
    conn
      .query("SELECT * FROM Users")
      .then(([result]) => {
        res.json(result);
      })
      .catch((err) => {
        console.error("Error fetching users from the database:", err);
        res.sendStatus(500);
      });
  }
}
