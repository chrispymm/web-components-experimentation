class BranchConditions extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute('role', 'grid')
    this.setAttribute('tabindex', '-1')

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

  cells(container=null) {
    if(container) {
      return container.querySelectorAll('[role="gridcell"]');
    } else {
      return this.querySelectorAll('[role="gridcell"]');
    }
  }

  get rows() {
    return this.querySelectorAll('[role="row"]');
  }

  get flowItem() {
    return this.closest('flow-item');
  }


  nextRow() {
    let nextRow;
    if(this.currentRowIndex === undefined) this.currentRowIndex = -1;
    let nextRowIndex = this.currentRowIndex + 1
    if(nextRowIndex > this.rows.length - 1) nextRowIndex = 0;

    nextRow = this.rows[nextRowIndex];

    if(this.nextRow){
      const cell = nextRow.querySelector('[role="gridcell"]')
      this.focusCell(cell);
      this.currentRowIndex = nextRowIndex;
    }
  }

  previousRow() {
    let prevRow;
    if(this.currentRowIndex === undefined) this.currentRowIndex = this.rows.length;
    let prevRowIndex = this.currentRowIndex - 1;
    if(prevRowIndex < 0 ) prevRowIndex = this.rows.length - 1;

    prevRow = this.rows[prevRowIndex];

    if(prevRow) {
      const cell = prevRow.querySelector('[role="gridcell"]')
      this.focusCell(cell);
      this.currentRowIndex = prevRowIndex;
    }
  }

  focusCell(cell) {
    this.removeInteractionFromCells();
    cell.setAttribute('tabindex', '0');
    cell.focus();
    this.focusedCell = cell;
  }

  removeInteractionFromCells() {
    this.cells().forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    })
  }

  setHeight() {
    const rows = this.querySelectorAll('[role="row"]').length;
    this.style.setProperty('--rows', rows);
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
      this.removeInteractionFromCells();
      this.currentRowIndex =  undefined;
    }
  }

  handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          event.stopPropagation();
          if(this.navigating) {
            this.nextRow();
          }
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          event.stopPropagation();
          if( this.navigating) {
            this.previousRow();
          }
          break;
        case 'Enter':
          event.stopPropagation();
          if(this.focusedCell) {
            this.navigating = false;
            this.activeCell = this.focusedCell;
            this.flowItem.makeInert();
            this.activeCell.makeInteractive();
          }
          break;
        case 'Escape':
          if(!this.navigating) {
            this.navigating = true;
          }
          this.flowItem.makeInteractive();
          if(this.activeCell) {
            this.focusCell(this.activeCell);
          }
          this.activeCell = undefined;
        default:
          break;
      }
  }
}
customElements.define('branch-conditions', BranchConditions);
