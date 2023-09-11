import { async } from 'regenerator-runtime';
import { API_KEY, API_URL, RESULT_PER_PAGE } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    result: [],
    page: 1,
    resultsPerPage: RESULT_PER_PAGE,
  },
  bookmarks: [],
};

function createRecipeObj(data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
}

export async function loadRecipe(id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
    state.recipe = createRecipeObj(data);
    if (state.bookmarks.some(b => b.id === id)) state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
}

export async function loadSearchResult(query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.result = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
}

export function getSearchResultPage(page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.result.slice(start, end);
}

export function updateServings(newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    //newQt = oldQt * newServings / oldServings
  });
  state.recipe.servings = newServings;
}

function persistBookmark() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export function addBookmark(recipe) {
  //Adding bookmark
  state.bookmarks.push(recipe);

  //mark current recipe bookmarked
  if (state.recipe.id === recipe.id) state.recipe.bookmarked = true;
  persistBookmark();
}

export function deleteBookmark(id) {
  let index;
  for (let i = 0; i < state.bookmarks.length; i++) {
    if (state.bookmarks[i].id === id) {
      index = i;
      break;
    }
  }
  state.bookmarks.splice(index, 1);

  //mark current recipe bookmarked false
  if (state.recipe.id === id) state.recipe.bookmarked = false;
  persistBookmark();
}

function init() {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
}
init();

export async function uploadRecipe(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].replaceAll('  ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format. Please use correct format and try again!!'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      cooking_time: +newRecipe.cookingTime,
      image_url: newRecipe.image,
      source_url: newRecipe.sourceUrl,
      servings: +newRecipe.servings,
      publisher: newRecipe.publisher,
      ingredients,
      id: '1243',
    };
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObj(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
}
