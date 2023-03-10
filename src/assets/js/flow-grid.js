const ITEM_WIDTH = 200;
const ITEM_HEIGHT = 125;
const CONDITION_WIDTH = 300;
const GAP_X = 100;
const GAP_Y = 130;

class FlowGrid extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.initialMarkup = this.innerHTML;
    this.render();
  }

  disconnectedCallback() {
    this.removeEventListener('focusin', this.onFocusIn);
    this.removeEventListener('focusout', this.onFocusOut);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  get items() {
    return this.querySelectorAll('.flow-item, .flow-branch');
  }

  render() {
    this.innerHTML = `
      <div role="row">
        ${this.initialMarkup}
      </div>
    `

    this.setAttribute('role', 'grid')
    this.setAttribute('tabindex', '0')
    this.classList.add('enhanced');

    this.setStyleProps();
    this.setItemPositions();
    this.setItemProperties();
    this.setHeight();
    this.setWidth();

    this.addEventListener('focusin', this.onFocusIn);
    this.addEventListener('focusout', this.onFocusOut);
    this.addEventListener('keydown', this.handleKeyDown);

  }

  setHeight() {
    const rows = Array.from( this.querySelectorAll('[data-row]'));
    let maxRow = rows.reduce((maxRow, row) => {
      let value = row.dataset.row;
      let number = value.substring(value.length-1);
      return Math.max(maxRow, number);
    }, 0)
    this.style.setProperty('--rows', maxRow)
  }

  setStyleProps(){
    this.style.setProperty('--item-width', `${ITEM_WIDTH}px`);
    this.style.setProperty('--item-height', `${ITEM_HEIGHT}px`);
    this.style.setProperty('--condition-width', `${CONDITION_WIDTH}px`);
    this.style.setProperty('--gap-x', `${GAP_X}px`);
    this.style.setProperty('--gap-y', `${GAP_Y}px`);
  }

  setWidth(){
    //get all items in the first row
    const cols = this.querySelectorAll('[data-row="1"]');
    //get branching points in first row
    const branchingPoints = this.querySelectorAll('[data-row="1"][type="Branching point"]');

    const itemsWidth = (cols.length - branchingPoints.length) * ITEM_WIDTH;
    const branchesWidth = branchingPoints.length * (ITEM_WIDTH + CONDITION_WIDTH);
    const gaps = (cols.length - 1) * 100;
    const width = itemsWidth + branchesWidth + gaps;
    this.style.width = width+'px';
  }

  setItemProperties() {
    this.items.forEach( (item) => {
      item.setAttribute('role', 'gridcell');
      item.setAttribute('tabindex', '-1');
      item.makeInert();
      item.addKeyboardGridNavigation();
    });
  }

  setItemPositions() {
    const cols = this.querySelectorAll('[data-row="1"]');
    let left = 0;

    cols.forEach( (col, index) => {
      let top = 0;
      let branch = false;
      const items = this.querySelectorAll(`[data-col="${index+1}"]`);

      items.forEach( (item, index) => {
        item.style.setProperty('--left', `${left}`);
        item.style.setProperty('--top', `${top}`);
        top = top + ITEM_HEIGHT + GAP_Y;
        branch = branch || (item.getAttribute('type') == 'Branching point')
      });

      if(branch) {
        left = left + ITEM_WIDTH + CONDITION_WIDTH + GAP_X;
      } else {
        left = left + ITEM_WIDTH + GAP_X;
      }
    });
  }

  next() {
    let nextItem;
    if(this.focusedItem) {
      const nextId = this.focusedItem.dataset.next;
      nextItem = this.querySelector('#'+nextId);
    } else {
      nextItem = this.items.item(0);
    }

    if(nextItem) {
      this.focusItem(nextItem);
    }
  }

  previous() {
    let prevItem;
    if(this.focusedItem) {
      const prevId = this.focusedItem.dataset.prev;
      prevItem = this.querySelector('#'+prevId);
    } else {
      prevItem = this.items.item(this.items.length - 1);
    }

    if(prevItem) {
      this.focusItem(prevItem);
    }
  }

  focusItem(item) {
     this.removeInteractionFromItems();
      item.setAttribute('tabindex', '0');
      item.focus();
      this.focusedItem = item;
  }

  removeInteractionFromItems() {
      this.items.forEach((item) => {
        item.makeInert();
        item.setAttribute('tabindex', '-1');
      })
  }

  onFocusIn(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      /* Focus was already in the container */
      this.navigating = true;
    } else {
      /* Focus was received from outside the container */
      this.navigating = true;
    }
  }

  onFocusOut(event){
    if (event.currentTarget.contains(event.relatedTarget)) {
        /* Focus will still be within the container */
    } else {
        /* Focus will leave the container */
      this.removeInteractionFromItems();
      this.focusedItem = undefined;
    }
  }

  handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          if(this.navigating) {
            this.next();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if( this.navigating) {
            this.previous();
          }
          break;
        case 'Enter':
          if(this.focusedItem) {
            this.navigating = false;
            this.activeItem = this.focusedItem;
            this.focusedItem.makeInteractive();
          }
          break;
        case 'Escape':
          if(!this.navigating) {
            this.navigating = true;
          }
          if(this.activeItem) {
            this.focusItem(this.activeItem);
          }
          this.activeItem = undefined;
        default:
          break;
      }
  }
}
customElements.define('flow-grid', FlowGrid)
