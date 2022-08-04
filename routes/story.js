/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const authMiddleware = require('./authMiddleware');
const router  = express.Router();

/**
 * Middleware: Check if story is completed
 * @param {node-postgress} db
 */
const isStoryComplete = (db)=>{
  return function(req, res, next) {
    const query = `SELECT is_complete FROM stories WHERE storyurl_id = $1;`;
    const inputValues = [ req.params.storyId ];

    db.query(query, inputValues)
      .then(data => {
        if (!data.rows[0].is_complete) {
          next();
        } else {
          throw Error("Story already completed");
        }
      })
      .catch(err => {
        res
          .status(403)
          .json({ error: err.message });
      });
  };
};


const getContributions = (db)=>{
  router.get("/:storyId/contributions", (req,res)=>{
    let query = ` SELECT contributions.user_id AS user_id,
                  contributions.user_id AS user_id,
                  contributions.id AS id,
                  contributions.accepted AS accepted,
                  contributions.content AS content,
                  contributions.created_at AS created_at,
                  count(contribution_likes.id) AS like_count,
                  users.username AS username
                FROM contributions
                JOIN users ON contributions.user_id = users.id
                LEFT JOIN contribution_likes ON contribution_id = contributions.id
                GROUP BY contributions.id, users.username
                HAVING contributions.story_id =
                  (SELECT id FROM stories WHERE storyurl_id = $1 )
                ORDER BY contributions.created_at DESC;`;
    const inputValues = [ req.params.storyId ];
    db.query(query, inputValues)
      .then(data => {
        res.json(data.rows);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

/**
 * Create a contribution for a story
 * @param {node-postgress} db
 * req.body: content
 */
const createContribution = (db)=>{
  router.post("/:storyId/contributions",
    authMiddleware(db),
    isStoryComplete(db),
    (req,res)=>{
    // TODO: should use user session

      const userId = req.session.userId;

      let query = `INSERT INTO contributions
          (user_id, story_id, content)
          VALUES ($1,
              (SELECT id FROM stories WHERE storyurl_id = $2),
            $3) RETURNING *;`;

      const inputValues = [
        userId,
        req.params.storyId,
        req.body.content
      ];

      db.query(query, inputValues)
        .then(data => {
          res.json(data.rows);
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    });
  return router;
};

/**
 * Like a contribution for a story
 * @param {node-postgress} db
 */
const likeContribution = (db)=>{
  router.post("/:storyId/contributions/:contributionId",
    authMiddleware(db),
    isStoryComplete(db),
    (req,res)=>{
    // TODO: should use user session
      console.log("--> Like contribution");
      const userId = req.session.userId;

      let query = `INSERT INTO contribution_likes
          (user_id, contribution_id)
          VALUES ($1, $2) RETURNING *;`;

      const inputValues = [userId, req.params.contributionId];

      db.query(query, inputValues)
        .then(data => {
          res.json(data.rows);
        })
        .catch(err => {
        // console.log(err)
          res
            .status(500)
            .json({ error: err.message });
        });
    });
  return router;
};

/**
 * Owner accepts a contribution for a story
 * @param {node-postgress} db
 */
const appendContribution = (db)=>{
  router.put("/:storyId/contributions/append/:contributionId",
    authMiddleware(db),
    isStoryComplete(db),
    (req,res)=>{
    // TODO: should use user session
      const userId = req.session.userId;

      const selectStoryQuery = `
      SELECT owner_id
      FROM stories
      WHERE storyurl_id = $1;
      `;

      const updateContributionQuery = `
      UPDATE contributions
      SET accepted = TRUE
      WHERE id = $1
      AND story_id = (SELECT id FROM stories WHERE storyurl_id = $2)
      RETURNING *
      ;`;
      db.query(selectStoryQuery, [req.params.storyId])
        .then(data => {
          if (userId !== data.rows[0].owner_id) {
            throw Error("Creator is not owner of story");
          }
          // Next request
          return db.query(updateContributionQuery, [req.params.contributionId, req.params.storyId]);
        })
        .then((dataTwo)=>{
          if (dataTwo.rowCount < 1) {
            throw Error("Error with accepting contribution");
          }
          res.json(dataTwo.rows);
        })
        .catch(err => {
        // console.log(err)
          res
            .status(500)
            .json({ error: err.message });
        });
    });
  return router;
};

/**
 * Owner marks a story as complete
 * @param {node-postgress} db
 */
const completeStory = (db)=>{
  router.put("/:storyId/complete",
    authMiddleware(db),
    isStoryComplete(db),
    (req,res)=>{
      const userId = req.session.userId;

      let selectStoryQuery = `SELECT owner_id FROM stories WHERE storyurl_id = $1`;

      let updateContributionDuery = `UPDATE stories
            SET is_complete = TRUE
            WHERE storyurl_id = $1 AND owner_id = $2
            RETURNING *;`;

      db.query(selectStoryQuery, [req.params.storyId])
        .then(data => {
          if (userId !== data.rows[0].owner_id) {
            throw Error("Creator is not owner of story");
          }
          return db.query(updateContributionDuery, [req.params.storyId, userId]);
        })
        .then((dataTwo) => {
          if (dataTwo.rowCount < 1) {
            throw Error("Error with completing story");
          }
          res.json(dataTwo.rows);
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    });
  return router;
};

module.exports = {
  getContributions,
  createContribution,
  likeContribution,
  appendContribution,
  completeStory
};
