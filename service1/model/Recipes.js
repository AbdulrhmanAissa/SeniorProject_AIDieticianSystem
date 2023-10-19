const mongoose = require('mongoose');

let recipeSchema = new mongoose.Schema({
    id: { type: Number},
    name: { type: String},
    calories: { type: Number},
    fat: { type: Number},
    satfat: { type: Number},
    carbs: { type: Number},
    fiber: { type: Number},
    sugar: { type: Number},
    protein: { type: Number},
    instructions: { type: String},
    ingredients: { type: String},
    tags: { type: String}
});


module.exports = mongoose.model('Recipe', recipeSchema);