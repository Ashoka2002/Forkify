import View from './View';
import previewView from './previewView';
import icons from 'url:../../img/icons.svg';

class BookmarkView extends View {
  _parentEl = document.querySelector('.bookmarks__list');
  _errorMsg = 'No bookmark yet. Find a nice recipe and bookmark it.';
  _message = '';

  addhandlerBookmark(handler) {
    window.addEventListener('load', () => handler);
  }

  _generateMarkup() {
    const id = window.location.hash.slice(1);
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new BookmarkView();
