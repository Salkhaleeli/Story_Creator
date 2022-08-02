/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const moment = require('moment');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    const OFFSET = 5;

    const queryString = `
    SELECT stories.title AS title,
    stories.is_complete AS status,
    stories.created_at AS created_at,
    stories.photo_url,
    stories.content,
    stories.storyurl_id AS url_id,
    COUNT(contributions.*) AS total_contributions,
    users.username AS created_by
    FROM stories
    JOIN users ON stories.owner_id = users.id
    LEFT JOIN contributions ON stories.id = contributions.story_id
    GROUP BY stories.id, users.username
    ORDER BY created_at DESC
    LIMIT $1
    ;`;

    return db.query(queryString, [OFFSET])
      .then(data => {
        let results = data.rows;

        for (const row of data.rows) {
          row.created_at = moment(row.created_at).format("MMM Do");
        }

        for (const row of data.rows){
          if (row.status) {
            row.status = "Completed"
          } else {
            row.status = "In Progress"
          }
        }

        const responseObj = { firstStory: results.splice(0,1), stories: results };
        // console.log(responseObj);
        res.render('stories', responseObj);
      })
      .catch(err => {
        console.log(err);
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  return router;
};
