const express = require('express');
const router  = express.Router();
const authMiddleware = require('./authMiddleware');

module.exports = (db) => {
  router.get('/:storyId', (req, res) => {
    const queryString = `
      SELECT title, content, photo_url, storyurl_id
      FROM stories
      WHERE storyurl_id = $1
    ;`;
    const queryParams = [
      req.params.storyId
    ];

    return db.query(queryString, queryParams)
      .then(result => {
        const story = result.rows[0];
        res.render('updatestory', {story: story});
      })
      .catch(err => {
        console.error(err);
        err
          .status(500)
          .send("error: ", err);
      });
  });

  router.post('/:storyId', authMiddleware(db), (req, res) => {
    const queryString = `
      UPDATE stories
      SET title = $1, content = $2, photo_url = $3
      WHERE storyurl_id = $4
      RETURNING *
    ;`;
    const queryParams = [
      req.body.title,
      req.body.content,
      req.body.photo_url,
      req.params.storyId
    ];

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
