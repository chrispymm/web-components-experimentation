class BranchCondition extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute('role', 'gridcell');

    this.createGridRow();
    this.makeInert();

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
    return this.querySelectorAll(':scope > h3 a, :scope > button');
  }

  get grid() {
    return this.closest('flow-grid');
  }

  createGridRow() {
    if(this.parentNode.getAttribute('role') !== 'row') {
    const row = document.createElement('div');
    row.setAttribute('role', 'row');

    this.parentNode.insertBefore(row, this);
    row.appendChild(this);
    }
  }

  makeInert() {
    this.classList.remove('active');
    this.interactiveElements.forEach((item) => {
      item.setAttribute('tabindex', '-1');
    })
    this.isInteractive = false;
  }

  makeInteractive() {
    this.classList.add('active');
    this.interactiveElements.forEach((item) => {
      item.setAttribute('tabindex', '0');
      item.removeAttribute('aria-disabled')
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
    }
  }

  onFocusOut(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      /* Focus will still be within the container */
      console.log('condition: focusout')
    } else {
      /* Focus will leave the container */
      this.makeInert();
      this.isInteractive = false;
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
          event.stopPropagation();
          this.focusNext();
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if(this.isInteractive) {
          event.stopPropagation();
          this.focusPrev();
        }
        break;
      case 'Escape':
        // Handled by focusOut
        break;
      case 'Enter':
        event.preventDefault();
        if(this.isInteractive) {
          event.stopPropagation();
          const nextItem = this.grid.querySelector('#'+event.target.dataset.target);
          if(nextItem) {
            event.preventDefault();
            this.grid.focusItem(nextItem);
          }
        }
        break;
      default:
        break;
    }
  }
}
customElements.define('branch-condition', BranchCondition);
