class FlowGrid extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.setAttribute('role', 'grid')
    this.setAttribute('tabindex', '0')
    this.classList.add('enhanced');

    this.createGridRow();
    this.setHeight();

    this.addEventListener('focusin', this.onFocusIn);
    this.addEventListener('focusout', this.onFocusOut);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('focusin', this.onFocusIn);
    this.removeEventListener('focusout', this.onFocusOut);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  get items() {
    return this.querySelectorAll('[role="gridcell"]');
  }

  createGridRow() {
    const row = document.createElement('div');
    row.setAttribute('role', 'row');

    const elements = Array.from(this.childNodes);
    if (elements && elements.length) {
      elements[0].parentNode.insertBefore(row, elements[0]);
      for (var i in elements) {
        row.appendChild(elements[i]);
      }
    }
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
    item.classList.add('focused');
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
