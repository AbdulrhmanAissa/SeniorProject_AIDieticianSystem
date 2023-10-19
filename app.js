const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const path = require('path');

const app = express();

// Import microservices
const service1 = require('./services/service-1/routes');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(morgan('combined')); // Logging middleware
app.use(express.static('public'));

//testing the landing page
app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.use('/service1', service1.route);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
