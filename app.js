const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();

const routes = require("./routes/routes");
const db = require("./helpers/keys").MongoURI;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("Mongoose Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", routes);

app.listen(5000, () => {
  console.log("Listening to " + 5000);
});
