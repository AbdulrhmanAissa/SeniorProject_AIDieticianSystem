const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  id: Number,
  name: String,
  source: String,
  preptime: Number,
  waittime: Number,
  cooktime: Number,
  servings: Number,
  comments: String,
  calories: Number,
  fat: Number,
  satfat: Number,
  carbs: Number,
  fiber: Number,
  sugar: Number,
  protein: Number,
  instructions: String,
  ingredients: [String],
  tags: [String], 
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
