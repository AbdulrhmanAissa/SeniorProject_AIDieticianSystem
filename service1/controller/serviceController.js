const bcrypt = require("bcryptjs");
const path = require('path');

const User = require('../model/User');

const register_get = (req, res) => {
   const error = req.session.error;
   req.session.error = undefined;
   res.sendFile(path.join(__dirname, '../../public/pages-register.html'));
};

const register_post = async (req, res) => {

   const {name, email, gender, age,
       height, weight, activity, allergies,
       vegetarian, vegan, glutenFree, healthgoal, password} = req.body;
 
   let user = await User.findOne({ email: email });
 
   if (user) {
     req.session.error = "User already exists";
     return res.redirect("/register");
   }
 
   const hasdPsw = await bcrypt.hash(password, 12);
 
   user = new User({name: name,
                   email: email,
                   gender: gender,
                   age: age,
                   height: height,
                   weight: weight,
                   activity: activity,
                   allergies: allergies,
                   vegetarian: vegetarian,
                   vegan: vegan,
                   glutenFree: glutenFree,
                   healthgoal: healthgoal,
                   password: hasdPsw});
 
   await user.save();
   res.redirect("/login");
};

const login_get = (req, res) => {
   const error = req.session.error;
   delete req.session.error;
   res.sendFile(path.join(__dirname, '../../public/pages-login.html'));
};

const login_post = async (req, res) => {
   req.session.destroy;

   const { email, password } = req.body;
 
   const user = await User.findOne({ email });
 
   if (!user) {
     req.session.error = "Invalid Credentials";
     return res.redirect("/login");
   }
 
   const isMatch = await bcrypt.compare(password, user.password);
 
   if (!isMatch) {
     req.session.error = "Invalid Credentials";
     return res.redirect("/login");
   }
 
   req.session.isAuth = true;
   req.session.user = user;
   res.redirect("/myprofile");
   
};

const logout = (req, res) => {
   req.session.destroy((err) => {
      if (err) throw err;
      res.redirect("/login");
    });
};

const myprofile_get = async (req, res) => {
   res.sendFile(path.join(__dirname, '../../public/users-profile.html'));
};

const myprofiledata_get = async (req, res) => {
   user = req.session.user;
   res.json(user);
};

const changepass_post = async (req, res) => {
   const { password, newpassword, renewpassword } = req.body;
   user = req.session.user;

   const isMatch = await bcrypt.compare(password, user.password);

   if(isMatch){
      if(newpassword === renewpassword){
         const newhasdPsw = await bcrypt.hash(newpassword, 12);
         const result = await User.findOneAndUpdate({password: user.password},{password: newhasdPsw},{ returnOriginal: false });
         res.redirect("/myprofile");
      }
   }
};


module.exports = { register_get, login_get, logout, register_post, login_post, myprofile_get, myprofiledata_get, changepass_post };