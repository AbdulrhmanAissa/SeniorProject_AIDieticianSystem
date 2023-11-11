const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String},
  gender: { type: String},
  age: {type: Number},
  height: {type: Number},
  weight: {type: Number},
  activity: {type: String},
  allergies: {type: String},
  vegetarian: {type: Boolean},
  vegan: {type: Boolean},
  glutenFree: {type: Boolean},
  healthgoal: {type: String},
  password: {type: String},
  mealplan: {type: Object},
  macrotracking: {type: Object}
});

module.exports = mongoose.model('User', userSchema);