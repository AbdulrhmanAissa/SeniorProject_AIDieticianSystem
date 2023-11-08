const bcrypt = require("bcryptjs");
const  OpenAIApi  = require('openai');
const User = require('../model/User');
const Recipes = require('../model/Recipes');


// Recipes Conroller
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipes.find();
    res.render('recipes-page.ejs', { recipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const openai = new OpenAIApi.OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const register_get = (req, res) => {
   const error = req.session.error;
   req.session.error = undefined;
   res.render('pages-register');
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
   req.session.isAuth = true;
   req.session.user = user;
   res.redirect("/myprofile");
};

const login_get = (req, res) => {
   const error = req.session.error;
   delete req.session.error;
   res.render('pages-login');
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
   user = req.session.user;
   res.render('users-profile',{ user: user });
};

const changepass_post = async (req, res) => {
   const { password, newpassword, renewpassword } = req.body;
   user = req.session.user;

   const isMatch = await bcrypt.compare(password, user.password);

   if(isMatch){
      if(newpassword === renewpassword){
         const newhasdPsw = await bcrypt.hash(newpassword, 12);
         const newuser = await User.findOneAndUpdate({password: user.password},{password: newhasdPsw},{ returnOriginal: false });
         req.session.isAuth = true;
         req.session.user = newuser;
         res.redirect("/myprofile");
      }
   }
};

const editprofile_post = async (req, res) => {
   const {Name, email, height, 
      weight, activityLevel, 
      allergies, vegetarian, 
      vegan, glutenFree, healthGoal} = req.body;
   user = req.session.user;
   
   
   if(Name.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{name: Name},{returnOriginal: false});}
   if(email.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{email: email},{returnOriginal: false});}
   if(height.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{height: height},{returnOriginal: false});}
   if(weight.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{weight: weight},{returnOriginal: false});}
   if(activityLevel.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{activity: activityLevel},{returnOriginal: false});}
   if(allergies.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{allergies: allergies},{returnOriginal: false});}
   if(typeof vegetarian === "string")  
      {if(vegetarian.length !== 0)
         {newuser = await User.findOneAndUpdate({_id: user._id},{vegetarian: true},{returnOriginal: false});}}
   else{
      newuser = await User.findOneAndUpdate({_id: user._id},{vegetarian: false},{returnOriginal: false});
   }
   if(typeof vegan === "string")
      {if(vegan.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{vegan: true},{returnOriginal: false});}}
   else{
      newuser = await User.findOneAndUpdate({_id: user._id},{vegan: false},{returnOriginal: false});
   }
   if(typeof glutenFree === "string")
      {if(glutenFree.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{glutenFree: true},{returnOriginal: false});}}
   else{
      newuser = await User.findOneAndUpdate({_id: user._id},{glutenFree: false},{returnOriginal: false});
   }
   if(healthGoal.length !== 0)
      {newuser = await User.findOneAndUpdate({_id: user._id},{healthgoal: healthGoal},{returnOriginal: false});}

   req.session.user = newuser;
   res.redirect("/myprofile");
};

const mealplanner = async (req,res)=>{
   try {
   user = req.session.user;
   // if(user.mealplan !== undefined){
   //    const NewDateTime = new Date();
   //    const Time = NewDateTime - user.mealplan.ResponseDateTime;
   //    console.log(Time);
   //    console.log(user.mealplan);
   //    res.render('mealplanner',{mealplan: user.mealplan});
   // }else{
      const bmr = floorToNearestHundred(calculateHarrisBenedictBMR(user.weight, user.height, user.age, user.gender));
      console.log("BMR = "+bmr);
      console.log("Total Calories = "+floorToNearestHundred(calculateHarrisBenedictTotalCalories(bmr,user.activity)));

      prompt = `Create a meal plan for a ${user.age} year old ${user.gender} who has 
     a weight of ${user.weight}kg and a height of ${user.height}cm and an activity level of 
     ${user.activity} and a health goal of ${user.healthgoal}. BMR = ${bmr}. 
     The total Calories should be ${floorToNearestHundred(calculateHarrisBenedictTotalCalories(bmr,user.activity))}`; 
      
     if(user.vegetarian!== undefined){
      if(user.vegetarian){prompt+="IMPORTANT!!! : They are a vegetarian. (exclude meat, poultry, ﬁsh and seafood)"};
     }

     if(user.vegan !== undefined){
      if(user.vegan){prompt+="IMPORTANT!!! : They are a vegan. (exclude all meat and animal products)"};
     } 

     if(user.glutenFree !== undefined){
      if(user.glutenFree){prompt+="IMPORTANT!!! : They are Gluten Free (exclude any foods that contain gluten)"};
     }
      
     if(user.allergies !== undefined){
      if(user.allergies.length !== 0){prompt+=`IMPORTANT!!! : They have the following allergies ${user.allergies}.`}
     };

      prompt+="\n#######\n Provide the total macronutrients as a JSON object(Carbs,Proteins,Fat) in grams for each meal and snack along with the Calories (as numbers not string).\n#######\n Provide the response in JSON format with keys of Breakfast, BreakfastMacronutrients,SnackOne, SnackOneMacronutrients, Lunch, LunchMacronutrients, SnackTwo, SnackTwoMacronutrients, Dinner, DinnerMacronutrients, Proteins, Carbs, Fat, Calories."
      prompt+="\n#######\nThe response should follow this format:"
      prompt+="{Breakfast: '',BreakfastMacronutrients: { Proteins: , Carbs: , Fat: , Calories:  },SnackOne: '',SnackOneMacronutrients: { Proteins: , Carbs: , Fat: , Calories:  },Lunch: '',LunchMacronutrients: { Proteins: , Carbs: , Fat: , Calories:  },SnackTwo: '',SnackTwoMacronutrients: { Proteins: , Carbs: , Fat: , Calories:  },Dinner: '',DinnerMacronutrients: { Proteins: , Carbs: , Fat: , Calories:  },Proteins: ,Carbs: ,Fat: ,Calories: }";
     const response = await openai.chat.completions.create({
       model: "gpt-3.5-turbo",
       messages: [{"role": "user", "content": prompt}],
     });

     const ResponseDateTime = new Date();
     console.log(ResponseDateTime);

      let newmealplan = response.choices[0].message.content;
      let newmealplan_json = JSON.parse(newmealplan);
      newmealplan_json.ResponseDateTime = ResponseDateTime;

      newuser = await User.findOneAndUpdate({_id: user._id},{ $set:{mealplan: newmealplan_json}},{returnOriginal: false});
      req.session.user = newuser;

      console.log(newmealplan_json);
      res.render('mealplanner',{ mealplan: newmealplan_json });
   // }
   } catch (error) {
     console.log(error);
     res.redirect("/myprofile");
   }
};

const meal_generator = async (req,res) =>{
   user = req.session.user;
   const MillSecInDay = 86400000;
   if(user.mealplan !== undefined){
      const NewDateTime = new Date();
      const Time = NewDateTime - user.mealplan.ResponseDateTime;
      console.log(Time);

      if(Time > MillSecInDay){
         res.render('mealgenerator',{user: user});
      }
      
      res.render('mealplanner',{mealplan: user.mealplan});
   }
   else{
      res.render('mealgenerator',{user: user});
   }
};

const faq = async (req,res) => {
   res.render('pages-faq');
};

function calculateHarrisBenedictBMR(weight, height, age, gender) {
if (gender === "Male") {
   // Harris-Benedict equation for men
   return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
} else {
   // Harris-Benedict equation for women
   return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
}
}

function calculateHarrisBenedictTotalCalories(bmr, activityLevel) {

switch (activityLevel) {
   case "Sedentary":
      return bmr * 1;
   case "Moderate":
      return bmr * 1.2;
   case "Active":
      return bmr * 1.5;
   default:
      throw new Error('Invalid activity level. Choose a value between 1 and 5.');
}
}

function floorToNearestHundred(number) {
   return Math.floor(number / 100) * 100;
}

// const totalCalories = calculateHarrisBenedictTotalCalories(bmr, activityLevel);


module.exports = { register_get, login_get, logout,
    register_post, login_post, myprofile_get,
      changepass_post, editprofile_post, mealplanner,faq, meal_generator,
        getAllRecipes};