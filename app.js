const express = require('express')
const app = express()
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const mongoose = require('mongoose')
require("dotenv").config();

// routes
const auth = require('./routes/auth')
const category = require('./routes/category')
const common = require('./routes/common')
const product = require('./routes/product')
const order = require('./routes/order')

// DB CONNECTION
mongoose.connect(process.env.DATABASE, {
}).then(()=>{
    console.log("DB CONNECTED")
}).catch((err) => {
    console.log(err)
})

app.use(cookieParser())
app.use(bodyparser.json())
app.use(cors())

// routes
app.use('/api/auth', auth);
app.use('/api/category', category);
app.use('/api/common', common);
app.use('/api/product', product);
app.use('/api/order', order);

const port = process.env.PORT || 2000;

app.listen(port, () => {
    console.log('Server is running at port ', port)
})