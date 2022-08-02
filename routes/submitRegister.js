/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const SALT = 10;

const submitRegister = (db) => {
  router.post('/', (req, res) => {
    const queryString1 = `SELECT email FROM users WHERE email =$1;`;
    const queryString2 = `INSERT INTO users ( username, first_name, last_name, email, password) VALUES($1, $2, $3, $4, $5)
        RETURNING *;`;

    db.query(queryString1, [req.body.email])
      .then(data => {
        if (data.rows[0]) {
          throw (Error("error: duplicate username"));
        }

        const password = req.body.password;
        const passwordHash = bcrypt.hashSync(password, SALT);

        const inputValue = [
          req.body.username,
          req.body.first_name,
          req.body.last_name,
          req.body.email,
          passwordHash
        ];

        return db.query(queryString2, inputValue);
      })
      .then(data => {
        // Set Cookie Session
        req.session['username'] = data.rows[0].username;

        res.redirect('/login');
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
module.exports = { submitRegister };
