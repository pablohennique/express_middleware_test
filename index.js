const express = require("express");
const path = require("path");
const logger = require("morgan");
const router = express.Router();

const app = express();

const port = 5001;

// Built in middelware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

// Application level middelware
const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date()} --- Request [${req.method}] [${req.url}]`);
  next();
};

app.use(loggerMiddleware);

// Third Party middelware
app.use(logger("dev"));

// Router level middelware
app.use("/api/users", router);

const fakeAuth = (req, res, next) => {
  const authStatus = true;
  if (authStatus) {
    console.log(`user authStatus : ${authStatus}`);
    next();
  } else {
    res.status(401);
    throw new Error("User not authorized");
  }
};

const getUsers = (req, res) => {
  res.json({ message: "Get all users" });
};

const createUser = (req, res) => {
  console.log(`This is the request body from client: `, req.body);
  res.json({ message: "Create new user" });
};

router.use(fakeAuth);
router.route("/").get(getUsers).post(createUser);

// Error handling middelware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  switch (statusCode) {
    case 401:
      res.json({
        title: "Unauthorized",
        message: err.message,
      });
      break;
    case 404:
      res.json({
        title: "Not Found",
        message: err.message,
      });
      break;
    case 500:
      res.json({
        title: "Server Error",
        message: err.message,
      });
      break;
  }
};

app.all("*", (req, res) => {
  res.status(404);
  throw new Error("Route not found");
});

app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
