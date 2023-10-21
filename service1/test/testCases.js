//Meal generator test cases

const meal_generator = require('./meal_generator'); // Import your function
const { mockRequest, mockResponse } = require('express');

describe('meal_generator', () => {
  it('should render mealgenerator when the mealplan is older than a day', () => {
    // Create a mock user with an outdated mealplan
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
    // Create a mock user with an up-to-date mealplan
    const user = {
      mealplan: {
        ResponseDateTime: new Date(),
      },
    };

    const req = mockRequest({ session: { user } });
    const res = mockResponse();

    meal_generator(req, res);

    // Assert that it renders 'mealplanner'
    expect(res.render).toHaveBeenCalledWith('mealplanner', { mealplan: user.mealplan });
  });

  it('should render mealgenerator when the user has no mealplan', () => {
    // Create a mock user with no mealplan
    const user = {};

    const req = mockRequest({ session: { user } });
    const res = mockResponse();

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
    // Mock the Recipes.find function to return a sample list of recipes
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
    // Mock the Recipes.find function to throw an error
    const errorMessage = 'An error occurred while fetching recipes';
    Recipes.find = jest.fn().mockRejectedValue(new Error(errorMessage));

    const req = mockRequest();
    const res = mockResponse();

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
const { mockRequest, mockResponse } = require('express');

describe('mealplanner', () => {
  let openaiCreateStub;
  let UserFindOneAndUpdateStub;

  beforeAll(() => {
    openaiCreateStub = jest.spyOn(openai.chat.completions, 'create');
    UserFindOneAndUpdateStub = jest.spyOn(User, 'findOneAndUpdate');
  });

  afterAll(() => {
    openaiCreateStub.mockRestore();
    UserFindOneAndUpdateStub.mockRestore();
  });

  it('should handle a successful response from OpenAI', async () => {
    // Mock the OpenAI API to return a successful response
    openaiCreateStub.mockResolvedValue({
      choices: [{ message: { content: 'Successful' } }],
    });

    // Mock the User.findOneAndUpdate to return the updated user
    const updatedUser = { _id: 'user_id', mealplan: { /* Updated meal plan data */ } };
    UserFindOneUpdateStub.mockResolvedValue(updatedUser);

    const req = mockRequest({
      session: { user: { _id: 'user_id' } }, // Mock user session data
    });
    const res = mockResponse();

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
    // Mock the OpenAI API to return an error response
    openaiCreateStub.mockRejectedValue(new Error('OpenAI API error'));

    const req = mockRequest({ session: { user: { _id: 'user_id' } }});
    const res = mockResponse();

    await mealplanner(req, res);

    // Assertions for handling errors and redirecting
    expect(res.redirect).toHaveBeenCalledWith('/myprofile');
  });
});



