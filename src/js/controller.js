import * as model from './model.js';
import bookmarkView from './views/bookmarkView.js';
import paginationgView from './views/paginationgView.js';
import recipeView from './views/recipeView.js';
import resultView from './views/resultView.js';
import searchView from './views/searchView.js';
import AddRecipeView from './views/AddRecipeView.js';
import { CLOSE_FORM_TIME } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

// if (module.hot) {
//   module.hot.accept();
// }

///////////////////////////////////////

const controlRecipe = async () => {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    //0)update results view to mark selected search result
    resultView.update(model.getSearchResultPage());
    bookmarkView.render(model.state.bookmarks);

    recipeView.renderSpinner();
    //1)Fetching api data
    await model.loadRecipe(id);
    const { recipe } = model.state;
    //2)Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

async function controlSearchResults() {
  try {
    resultView.renderSpinner();
    //1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load search results
    await model.loadSearchResult(query);
    // resultView.render(model.state.search.result);
    //3) Render results
    resultView.render(model.getSearchResultPage());

    //Rendering initial Pagination buttons
    paginationgView.render(model.state.search);
  } catch (err) {
    throw err;
  }
}

function controlPagination(pageToGo) {
  //Rendering new results
  resultView.render(model.getSearchResultPage(pageToGo));

  //Rendering new Pagination buttons
  paginationgView.render(model.state.search);
}

function controlServings(servings) {
  //updating new servings
  model.updateServings(servings);
  //rendering new servings
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
  if (model.state.recipe.bookmarked)
    model.deleteBookmark(model.state.recipe.id);
  else model.addBookmark(model.state.recipe);

  recipeView.update(model.state.recipe);

  //rendering bookmark
  bookmarkView.render(model.state.bookmarks);
}

function controlBookmark() {
  bookmarkView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try {
    AddRecipeView.renderSpinner();
    //Upload new Recipe
    await model.uploadRecipe(newRecipe);
    bookmarkView.render(model.state.bookmarks);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    AddRecipeView.renderMessage();
    recipeView.render(model.state.recipe);
    //close form
    setTimeout(() => {
      AddRecipeView.toggleWindow();
    }, CLOSE_FORM_TIME);
  } catch (err) {
    console.error(err);
    AddRecipeView.renderError(err.message);
  }
}

function init() {
  bookmarkView.addhandlerBookmark(controlBookmark);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerServingsUpdate(controlServings);
  recipeView.addHandlerOnBookmark(controlAddBookmark);
  searchView.addSearchHandler(controlSearchResults);
  paginationgView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
}

init();
