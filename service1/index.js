const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();

const serviceController = require("./controller/serviceController");
const isAuth = require("./middleware/isAuth");

const app = express();
app.set("view engine", "ejs");
app.use(express.static('public'));
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

app.get("/Dashboard", (req,res)=>{
  user = req.session.user;
  res.render("index",{user:user});
});

app.get("/components-modal", (req,res)=>{
  user = req.session.user;
  res.render('components-modal',{user:user});
});

app.get("/components-alerts", (req,res)=>{
  user = req.session.user;
  res.render('components-alerts',{user:user});
});

app.get("/components-accordion", (req,res)=>{
  user = req.session.user;
  res.render('components-accordion',{user:user});
});

app.get("/components-breadcrumbs", (req,res)=>{
  user = req.session.user;
  res.render('components-breadcrumbs',{user:user});
});

app.get("/components-buttons", (req,res)=>{
  user = req.session.user;
  res.render('components-buttons',{user:user});
});

app.get("/components-cards", (req,res)=>{
  user = req.session.user;
  res.render('components-cards',{user:user});
});

app.get("/components-carousel", (req,res)=>{
  user = req.session.user;
  res.render('components-carousel',{user:user});
});

app.get("/components-list-group", (req,res)=>{
  user = req.session.user;
  res.render('components-list-group',{user:user});
});

app.get("/components-modal", (req,res)=>{
  user = req.session.user;
  res.render('components-modal',{user:user});
});

app.get("/components-tabs", (req,res)=>{
  user = req.session.user;
  res.render('components-tabs',{user:user});
});

app.get("/components-pagination", (req,res)=>{
  user = req.session.user;
  res.render('components-pagination',{user:user});
});

app.get("/components-progress", (req,res)=>{
  user = req.session.user;
  res.render('components-progress',{user:user});
});

app.get("/components-spinners", (req,res)=>{
  user = req.session.user;
  res.render('components-spinners',{user:user});
});

app.get("/components-tooltips", (req,res)=>{
  user = req.session.user;
  res.render('components-tooltips',{user:user});
});

app.get("/forms-elements", (req,res)=>{
  user = req.session.user;
  res.render('forms-elements',{user:user});
});

app.get("/forms-layouts", (req,res)=>{
  user = req.session.user;
  res.render('forms-layouts',{user:user});
});

app.get("/forms-editors", (req,res)=>{
  user = req.session.user;
  res.render('forms-editors',{user:user});
});

app.get("/forms-validation", (req,res)=>{
  user = req.session.user;
  res.render('forms-validation',{user:user});
});

app.get("/tables-general", (req,res)=>{
  user = req.session.user;
  res.render('tables-general',{user:user});
});

app.get("/tables-data", (req,res)=>{
  user = req.session.user;
  res.render('tables-data',{user:user});
});

app.get("/charts-chartjs", (req,res)=>{
  user = req.session.user;
  res.render('charts-chartjs',{user:user});
});

app.get("/charts-apexcharts", (req,res)=>{
  user = req.session.user;
  res.render('charts-apexcharts',{user:user});
});

app.get("/charts-echarts", (req,res)=>{
  user = req.session.user;
  res.render('charts-echarts',{user:user});
});

app.get("/icons-bootstrap", (req,res)=>{
  user = req.session.user;
  res.render('icons-bootstrap',{user:user});
});

app.get("/icons-remix", (req,res)=>{
  user = req.session.user;
  res.render('icons-remix',{user:user});
});

app.get("/icons-boxicons", (req,res)=>{
  user = req.session.user;
  res.render('icons-boxicons',{user:user});
});

app.get('/userdata', (req,res)=>{
  user = req.session.user;
  res.json(user);
});

app.get("/login", serviceController.login_get);
app.get("/register", serviceController.register_get);
app.get("/myprofile", isAuth, serviceController.myprofile_get);
app.get("/logout", serviceController.logout);
app.get("/mealplan",isAuth, serviceController.mealplanner);
app.get("/mealplanner",isAuth ,serviceController.meal_generator);
app.get("/faq",isAuth, serviceController.faq);

app.post("/login", serviceController.login_post);
app.post("/register", serviceController.register_post);
app.post("/changepass", serviceController.changepass_post);
app.post("/editprofile", serviceController.editprofile_post);

app.use((request, response) => {
    response.status(404).render('pages-error-404');
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


