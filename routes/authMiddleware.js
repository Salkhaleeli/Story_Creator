const auth = (db) =>{
  return (req,res,next) => {

    const userName = req.session["username"];

    console.log("--> user:", userName);

    if (!userName) {
      console.log("--> auth: not logged in");
      res.json({redirect: "/register"});
      return;
    }

    const queryString = `SELECT id FROM users
    WHERE users.username = $1`;

    db.query(queryString, [ userName ])
      .then(data =>{
        if (data.rows[0]) {
          req.session.userId = data.rows[0].id;
          return next();
        } else {
          console.log("--> auth: not logged in");
          return res.redirect('/register');
        }
      });
  };
};

module.exports = auth;
