//import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// define the Express app
const app = express();

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://max33.eu.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: "IuD3C7GiX32G2flLeZFLJwIEnhczci5g",
  issuer: `https://max33.eu.auth0.com/`,
  algorithms: ["RS256"]
});

//app.use(checkJwt);

// the database
const questions = [];

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan("combined"));

// retrieve all questions
app.get("/", (req, res) => {
  const qs = questions.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    answers: q.answers.length
  }));
  res.send(qs);
});

// get a specific question
app.get("/:id", (req, res) => {
  const question = questions.filter(q => q.id === parseInt(req.params.id));
  if (question.length > 1) return res.status(500).send();
  if (question.length === 0) return res.status(404).send();
  res.send(question[0]);
});

// insert a new question
app.post("/", checkJwt, (req, res) => {
  const { title, description } = req.body;
  const newQuestion = {
    id: questions.length + 1,
    title,
    description,
    answers: [],
    author: req.user.name
  };
  questions.push(newQuestion);
  res.status(200).send();
});

// insert a new answer to a question
app.post("/answer/:id", checkJwt, (req, res) => {
  const { answer } = req.body;

  const question = questions.filter(q => q.id === parseInt(req.params.id));
  if (question.length > 1) return res.status(500).send();
  if (question.length === 0) return res.status(404).send();

  question[0].answers.push({
    answer,
    author: req.user.name
  });

  res.status(200).send();
});

// start the server
app.listen(8081, () => {
  console.log("listening on port 8081");
});
