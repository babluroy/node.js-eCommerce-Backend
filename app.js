const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {pollOrderQueue} = require("./workers/orderWorker")
const mongoose = require("mongoose");
require("dotenv").config();

// routes
const apiRoutes = require("./routes/api");
const multer = require("multer");

// DB CONNECTION
mongoose
    .connect(process.env.DATABASE, {})
    .then(() => {
        console.log("DB CONNECTED");
    })
    .catch((err) => {
        console.log(err);
    });

app.use(cookieParser());
app.use(express.json());
app.use(multer().array()) //For form-data 
app.use(cors());
// Start polling order SQS messages
pollOrderQueue();


app.use("/api/", apiRoutes);

const port = process.env.SERVER_PORT || 2000;
const host = process.env.SERVER_HOST || '0.0.0.0'; 

app.listen(port, host, () => {
    console.log(`Server started http://${host}:${port}`);
});
