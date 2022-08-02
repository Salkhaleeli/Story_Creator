const express = require('express');
const router  = express.Router();
const moment = require('moment');

module.exports = (db) => {
  router.get("/:storyId", (req, res) => {

    // TEMPL SHOULD REMOVE
    const userId = req.session.userId;

    const queryString = `
      SELECT title, 
      content,
      is_complete,
      photo_url,
      stories.created_at AS created_at,
      users.username AS username,
      owner_id,
      storyurl_id
      FROM stories
      JOIN users ON owner_id = users.id
      WHERE stories.storyurl_id = $1
    ;`;


    const queryStringContributions = `
    SELECT contributions.content AS content, 
      contributions.created_at AS created_at, 
      users.username AS username
    FROM contributions
    JOIN users ON contributions.user_id = users.id
    WHERE contributions.story_id = 
      (SELECT id FROM stories WHERE storyurl_id = $1
        AND contributions.accepted = TRUE)
    ORDER BY contributions.created_at ASC;`;


    const queryParams = [
      req.params.storyId
    ];

    return db.query(queryString, queryParams)
      .then(data => {
        const results = data.rows[0];
        let isOwner = false;

        for (const row of data.rows) {
          row.created_at = moment(row.created_at).format("MMM Do");
        }

        if (userId === data.rows[0].owner_id) {
          isOwner = true;
        }

        if (results.is_complete) {
          db.query(queryStringContributions, queryParams)
            .then(dataRequestContributions => {
              console.log(dataRequestContributions.rows);
              return res.render('completestory',{
                story: results,
                contributions: dataRequestContributions.rows,
                isOwner
              });
            });
        } else {
          return res.render('story', { story: results, isOwner});
        }
        
      });
  });

  return router;
};