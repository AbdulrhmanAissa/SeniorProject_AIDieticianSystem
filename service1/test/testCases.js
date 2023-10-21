//Meal generator test cases

const meal_generator = require('./meal_generator'); // Import your function
const { req, res } = require('express');

describe('meal_generator', () => {
  it('should render mealgenerator when the mealplan is older than a day', () => {
    
    const user = {
      mealplan: {
        ResponseDateTime: new Date(new Date() - 2 * 24 * 60 * 60 * 1000), // Older than a day
      },
    };

    const req = mockRequest({ session: { user } });
    const res = mockResponse();

    meal_generator(req, res);

    // Assert that it renders 'mealgenerator'
    expect(res.render).toHaveBeenCalledWith('mealgenerator', { user });
  });

  it('should render mealplanner when the mealplan is up to date', () => {

    const user = {
      mealplan: {
        ResponseDateTime: new Date(),
      },
    };

    const req = request({ session: { user } });
    const res = response();

    meal_generator(req, res);

    // Assert that it renders 'mealplanner'
    expect(res.render).toHaveBeenCalledWith('mealplanner', { mealplan: user.mealplan });
  });

  it('should render mealgenerator when the user has no mealplan', () => {
    
    const user = {};

    const req = request({ session: { user } });
    const res = response();

    meal_generator(req, res);

    // Assert that it renders 'mealgenerator'
    expect(res.render).toHaveBeenCalledWith('mealgenerator', { user });
  });
});


// Get all recipes 

const getAllRecipes = require('./getAllRecipes'); // Import your function
const Recipes = require('./Recipes.js'); // Import your Recipes model
const { mockRequest, mockResponse } = require('express');

describe('getAllRecipes', () => {
  it('should render recipes-page with a list of recipes', async () => {
    
    const sampleRecipes = [
      { title: 'Recipe 1', description: 'Description 1' },
      { title: 'Recipe 2', description: 'Description 2' },
    ];
    Recipes.find = jest.fn().mockResolvedValue(sampleRecipes);

    const req = mockRequest();
    const res = mockResponse();

    await getAllRecipes(req, res);

    expect(res.render).toHaveBeenCalledWith('recipes-page.ejs', { recipes: sampleRecipes });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle errors and respond with a 500 status and error message', async () => {
    
    const errorMessage = 'An error occurred while fetching recipes';
    Recipes.find = jest.fn().mockRejectedValue(new Error(errorMessage));

    const req = request();
    const res = response();

    await getAllRecipes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    expect(res.render).not.toHaveBeenCalled();
  });
});

// Meal planner 

const mealplanner = require('./mealplanner'); // Import your function
const openai = require('./openai'); 
const User = require('./User.js'); // Import your User model
const { req, res } = require('express');

describe('mealplanner', () => {
  let openaiCreateStub;
  let UserFindOneAndUpdateStub;

  beforeAll(() => {
    openaiCreateStub = jest.spyOn(openai.chat.completions, 'create');
    UserFindOneAndUpdateStub = jest.spyOn(User, 'findOneAndUpdate');
  });

  afterAll(() => {
    openaiCreateStub.restore();
    UserFindOneAndUpdateStub.restore();
  });

  it('should handle a successful response from OpenAI', async () => {
    
    openaiCreateStub.resolvedValue({
      choices: [{ message: { content: 'Successful' } }],
    });

    
    const updatedUser = { _id: 'user_id', mealplan: { } };
    UserFindOneUpdateStub.resolvedValue(updatedUser);

    const req = request({
      session: { user: { _id: 'user_id' } }, 
    });
    const res = response();

    await mealplanner(req, res);

    // Assertions for rendering and updating user
    expect(res.render).toHaveBeenCalledWith('mealplanner', { mealplan: updatedUser.mealplan });
    expect(UserFindOneUpdateStub).toHaveBeenCalledWith(
      { _id: 'user_id' },
      {
        $set: { mealplan: updatedUser.mealplan },
      },
      { returnOriginal: false }
    );
  });

  it('should handle an error response from OpenAI', async () => {
    
    openaiCreateStub.mockRejectedValue(new Error('OpenAI API error'));

    const req = request({ session: { user: { _id: 'user_id' } }});
    const res = response();

    await mealplanner(req, res);

    // Assertions for handling errors and redirecting
    expect(res.redirect).toHaveBeenCalledWith('/myprofile');
  });
});



