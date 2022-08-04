const express = require('express');
const router  = express.Router();
const { generateRandomId } = require('../lib/data-helpers.js');
const authMiddlewareRedirect = require('./authMiddlewareRedirect');

module.exports = (db) => {

  router.get("/", (req, res) => {
    res.render('createstory');
  });

  router.post("/story", authMiddlewareRedirect(db), (req, res) => {
    const user_id = req.session.userId;
    const queryString = `
    INSERT INTO stories (
      owner_id,
      title,
      content,
      photo_url,
      storyurl_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    ;`;

    const queryParams = [
      user_id,
      req.body.title,
      req.body.content,
      req.body.photo_url,
      generateRandomId(6)];
    console.log(queryString, queryParams);
    return db.query(queryString, queryParams)
      .then(result => {
        const story = result.rows[0];
        res.redirect(`/story/${story.storyurl_id}`);
      })
      .catch(err => {
        console.error(err);
        res
          .status(500)
          .send("error: ", err);
      });
  });

  return router;
};
