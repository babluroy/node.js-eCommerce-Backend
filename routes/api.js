var express = require("express");
var app = express();

const apiResponse = require("./../helpers/apiResponse");
const auth = require("./auth");
const category = require("./category");
const common = require("./common");
const product = require("./product");
const order = require("./order");
const payment = require("./payment");

// routes
app.use("/auth", auth);
app.use("/categories", category);
app.use("/common", common);
app.use("/products", product);
app.use("/orders", order);
app.use("/payment", payment);

// throw 404 if URL not found
app.all("*", function (req, res) {
  return apiResponse.notFoundResponse(res, "Page not found");
});
module.exports = app;
