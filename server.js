// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";

const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const morgan     = require('morgan');
const cookieSession = require('cookie-session');

// PG database client/connection setup
const app       = express();
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieSession({
  name: 'user_id',
  keys: ['key1']
}));

app.set("view engine", "ejs");
app.use(express.json());
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Cookie Session
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Separated Routes for each Resource
const userLogin = require("./routes/login");
const submitLogin = require("./routes/submitLogin");
const storyRoutes = require("./routes/story");
const toHomePage = require("./routes/home");
const createRoutes = require("./routes/createstory");
const updateRoutes = require("./routes/updatestory");
const displayStory = require("./routes/storytop");
const registerUser = require("./routes/register");
const registered = require("./routes/submitRegister");

const authMiddlewareRedirect = require("./routes/authMiddlewareRedirect");

/**
 * API ROUTES
 */

// Route to get contributions
app.use("/api/story", storyRoutes.createContribution(db));
app.use("/api/story", storyRoutes.getContributions(db));

app.use("/api/story", storyRoutes.appendContribution(db));
app.use("/api/story", storyRoutes.likeContribution(db));

app.use("/api/story", storyRoutes.completeStory(db));

// Registration and login
app.use("/register", registerUser(db));
app.use("/api/register", registered.submitRegister(db));
app.use("/login",userLogin.toLogin(db));
app.use("/api/login", submitLogin.toSubmit(db));

// home pages
app.use("/", toHomePage(db));
// app.use("/stories", toHomePage(db));

// create and update story
app.use("/new", createRoutes(db));
app.use("/update", authMiddlewareRedirect(db), updateRoutes(db));
app.use("/story", displayStory(db));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

module.exports = app;
