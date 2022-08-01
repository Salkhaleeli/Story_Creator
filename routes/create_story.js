const express = require('express');
const router  = express.Router();


const getCreateStory = function() {
  // render create story form
  router.get('/', (req, res) => {
    res.render('create_story');
  });
}

const postCreateStory = function() {
  router.post('/story', (req, res) => {
    // TODO: Insert query for inserting to db
  });
}

module.exports = { getCreateStory }
