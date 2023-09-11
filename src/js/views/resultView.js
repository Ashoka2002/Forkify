import View from './View';
import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';

class ResultView extends View {
  _parentEl = document.querySelector('.results');
  _errorMsg = 'No recipes found for your query! Please try again.';
  _message = '';
  _generateMarkup() {
    const id = window.location.hash.slice(1);
    return this._data.map(result => previewView.render(result, false)).join('');
  }
}

export default new ResultView();
