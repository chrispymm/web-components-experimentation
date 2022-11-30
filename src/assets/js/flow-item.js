class FlowItem extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.currenFocusIndex;

    this.setAttribute('role', 'gridcell')
    this.setAttribute('tabindex', '-1')
    this.classList.add('enhanced')

    this.makeInert();
    this.setPositions();

    this.addEventListener('focusin', this.onFocusIn);
    this.addEventListener('focusout', this.onFocusOut);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('focusin', this.onFocusIn);
    this.removeEventListener('focusout', this.onFocusOut);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  get interactiveElements() {
    return this.querySelectorAll('a, button');
  }

  get type() {
    return this.getAttribute('type');
  }

  get variant() {
    return this.getAttribute('variant') || '';
  }

  get row() {
    return this.dataset.row - 1;
  }

  get column() {
    return this.dataset.col - 1;
  }

  get linkElement() {
    return this.querySelector('a');
  }

  setPositions() {
    this.style.setProperty("--col-index", this.column);
    this.style.setProperty("--row-index", this.row);
    if(this.type == 'Branching point') {
      let conditions = this.querySelectorAll('ul.conditions > li');
      console.log(conditions);
      conditions.forEach( (condition) => {
        console.log(condition.dataset.row);
        condition.style.setProperty("--row-index", condition.dataset.row - 1)
      })
    }
  }

  makeInert() {
    this.interactiveElements.forEach((item) => {
      item.setAttribute('tabindex', '-1');
    })
    this.isInteractive = false;
  }

  makeInteractive() {
    this.interactiveElements.forEach((item) => {
      item.setAttribute('tabindex', '0');
    });
    this.isInteractive = true;
    this.focusNext();
  }

  focusNext() {
    let index = this.currentFocusIndex;
    if(index === undefined) index = -1
    ++index;
    if(index >= this.interactiveElements.length) {
      index = 0;
    }
    this.interactiveElements.item(index).focus();
    this.currentFocusIndex = index;
  }

  focusPrev() {
    let index = this.currentFocusIndex || this.interactiveElements.length;
    --index;
    if(index < 0) {
      index = this.interactiveElements.length-1
    }
    this.interactiveElements.item(index).focus();
    this.currentFocusIndex = index;
  }

  onFocusIn(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      /* Focus was already in the container */
    } else {
      /* Focus was received from outside the container */
      console.log('focus into grid')
    }
  }

  onfocusOut(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      /* Focus will still be within the container */
    } else {
      /* Focus will leave the container */
      console.log('focus out  of item');
      this.makeInert();
      this.currentFocusIndex = undefined;
    }
  }

  handleKeyDown(event) {
    let shiftKey = event.shiftKey;
    switch (event.key) {
      case 'Tab':
        if(this.isInteractive){
          event.preventDefault();
          if(shiftKey) {
            this.focusPrev();
          } else {
            this.focusNext();
          }
        }
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        if(this.isInteractive) {
          this.focusNext();
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if(this.isInteractive) {
          this.focusPrev();
        }
        break;
      case 'Escape':
        this.makeInert();
        this.isInteractive = false;
        this.currentFocusIndex = undefined;
        break;
      case 'Enter':
        if(this.isInteractive) {
          event.stopPropagation();
          console.log(event);
          const grid = this.closest('flow-grid');
          const nextItem = grid.querySelector('#'+event.target.dataset.target);
          if(nextItem) {
            event.preventDefault();
            grid.focusItem(nextItem);
          }
        }
        break;
      default:
        break;
    }
  }

}
customElements.define('flow-item', FlowItem)
