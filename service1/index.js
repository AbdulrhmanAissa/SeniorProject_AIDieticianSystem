const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();
const path = require('path');


const serviceController = require("./controller/serviceController");
const isAuth = require("./middleware/isAuth");

const app = express();
app.use(express.static('../public'));
app.use(express.urlencoded({ extended: false }));

let sessionStore = new MongoDBStore({
	uri: process.env.MONGO_URI,
	collection: 'mySessions'
});

sessionStore.on('error', function(error) {
    console.log(error);
});

app.use(session({
	secret: process.env.SESSION_SECRET,
	cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    },
	saveUninitialized: true,
	resave: true,
	store: sessionStore
}));


app.get("/login", serviceController.login_get);
app.get("/register", serviceController.register_get);
app.get("/myprofile", isAuth, serviceController.myprofile_get);
app.get("/logout", serviceController.logout);
app.get("/myprofile/data",serviceController.myprofiledata_get);

app.post("/login", serviceController.login_post);
app.post("/register", serviceController.register_post);
app.post("/changepass", serviceController.changepass_post);

app.use((request, response) => {
    response.status(404).sendFile(path.join(__dirname, '../public/pages-error-404.html'));
});


mongoose.connect(process.env.MONGO_URI)
  .then((result) => { 
      console.log('Connected to database...');
      app.listen(process.env.PORT, "localhost", () => { 
        console.log(`Listening on port ${process.env.PORT}...`) 
        console.log("Connected Database Name: "+mongoose.connection.name);
      });
    })
  .catch((err) => {console.log(err); });  