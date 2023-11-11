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
const { req, res } = require('express');

describe('getAllRecipes', () => {
  it('should render recipes-page with a list of recipes', async () => {
    
    const sampleRecipes = [
      { title: 'Recipe 1', description: 'Description 1' },
      { title: 'Recipe 2', description: 'Description 2' },
    ];
    Recipes.find = jest.fn().mockResolvedValue(sampleRecipes);

    const req = request();
    const res = response();

    await getAllRecipes(req, res);

    expect(res.render).toHaveBeenCalledWith('recipes-page.ejs', { recipes: sampleRecipes });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle errors and respond with a 500 status and error message', async () => {
    
    const errorMessage = 'An error occurred while fetching recipes';
    Recipes.find = jest.fn().rejectedValue(new Error(errorMessage));

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


//Water Tracker 

const { mockRequest, mockResponse } = require('express');

const waterTrackerModule = require('./serviceController');

describe('watertracker', () => {
  it('updates user macrotracking for the current day', async () => {
    // The user object and the User model
    const mockUser = {
      _id: 'user._id',
      macrotracking: [
        { day: 'Sunday', data: [{ water: 50 }], datetime: new Date() },
        // ... other days
      ],
    };

    const mockUserModel = {
      findByIdAndUpdate: jest.fn().mockReturnValueOnce({ user: user._id }),
    };

    // The request and response objects
    const req = request({
      session: { user: user._id },
      body: { wateramount: '20' },
    });

    const res = response();

    // Setting the Date to a known day
    jest.spyOn(global, 'Date').setDay(() => new Date('2023-11-11T12:00:00Z'));

    // Calling the watertracker method
    await waterTrackerModule.watertracker(req, res, userModel);

    // Expectation
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      { _id: 'user._id' },
      {
        macrotracking: [
          { day: 'Sunday', data: [{ water: 70 }], datetime: expect.any(Date) },
          // ... other days
        ],
      },
      { returnOriginal: false }
    );

    expect(res.redirect).toHaveBeenCalledWith('/Dashboard');

    // Restoring the Date object to its original implementation
    global.Date.mockRestore();
  });
});

// Recipes Filter 

const recipes = require('./recipes');

describe('filterRecipes', () => {
  beforeEach(() => {
    // Set up a basic HTML structure with a search input, checkboxes, and recipe cards
    document.body.innerHTML = `
      <input id="searchInput" value="" />
      <input type="checkbox" class="tagCheckbox" value="tag1" />
      <input type="checkbox" class="tagCheckbox" value="tag2" />
      <div class="recipeCard" style="display: block;">
        <span id="recipeName">Recipe 1</span>
        <ul id="recipeTags">
          <li>tag1</li>
          <li>tag2</li>
        </ul>
      </div>
      <div class="recipeCard" style="display: block;">
        <span id="recipeName">Recipe 2</span>
        <ul id="recipeTags">
          <li>tag1</li>
        </ul>
      </div>
    `;
  });

  it('filters recipes based on search term and selected tags', () => {
    // Console.log method to capture the output
    const consoleSpy = jest.spyOn(console, 'log').implementation();

    // Trigger the filterRecipes function
    recipes.filterRecipes();

    // Expectations based on the provided HTML structure
    expect(consoleSpy).toHaveBeenCalledWith('Selected Tags:', ['tag1']);
    expect(consoleSpy).toHaveBeenCalledWith('Tag Match:', true);
    expect(consoleSpy).toHaveBeenCalledWith('Text Match:', true);

    // Restore the original console.log method
    consoleSpy.restore();
  });
});

