/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');

const toSubmit = (db) =>{
  router.post("/", (req, res)=>{
    const queryString = `SELECT username, password FROM users 
    WHERE  users.email = $1`;

    console.log(req.body);

    db.query(queryString, [ req.body.email ])
      .then(data =>{
        const password = req.body.password;
        const passwordHash = data.rows[0].password;

        if (bcrypt.compareSync(password, passwordHash)) {
          // Set sessions here
          req.session['username'] = data.rows[0].username;
          res.redirect("/");
        } else {
          throw (Error("Wrong password or username"));
        }
      })
      .catch(err=>{
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

module.exports = { toSubmit };