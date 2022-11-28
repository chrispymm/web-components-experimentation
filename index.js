class FlowGrid extends HTMLElement {
  constructor() {
    super()

    const template = document.querySelector('#flow-grid-template');
    const templateContent = template.content
    const shadowRoot = this.attachShadow({ mode: "open" });

    // this.navigating = true;

    shadowRoot.appendChild(templateContent.cloneNode(true));
    this.setAttribute('role', 'grid')
    this.setAttribute('tabindex', '0')


    this.addEventListener('focusin', (e) => {
      if (e.currentTarget.contains(e.relatedTarget)) {
		/* Focus was already in the container */
        console.log('focus from within grid')
        this.navigating = true;
	  } else {
		/* Focus was received from outside the container */
        this.navigating = true;
        console.log('focus into grid')
	  }
    });

    this.addEventListener('focusout', (e) => {
      if (e.currentTarget.contains(e.relatedTarget)) {
          /* Focus will still be within the container */
      } else {
          /* Focus will leave the container */
        console.log('focus out of the grid')
        this.removeInteractionFromItems();
        this.focusedItem = undefined;
      }
    })

    this.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if(this.navigating) {
            this.next();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if( this.navigating) {
            this.previous();
          }
          break;
        case 'Enter':
          console.log(this.navigating)
          //if(this.navigating) {
            this.navigating = false;
            this.activeItem = this.focusedItem;
            this.focusedItem.makeInteractive();
          //}
          break;
        case 'Escape':
          console.log(this.focusedItem)
          if(!this.navigating) {
            this.navigating = true;
          }
          this.focusItem(this.activeItem);
          this.activeItem = undefined;
        default:
          break;
      }
    });

  }

  connectedCallback() {
  }

  get items() {
      return this.querySelectorAll('[role="gridcell"]');
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
        item.setAttribute('tabindex', '-1');
      })
  }

}
customElements.define('flow-grid', FlowGrid)

class FlowItem extends HTMLElement {
  constructor() {
    super()

    const template = document.querySelector('#flow-item-template');
    const templateContent = template.content
    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.appendChild(templateContent.cloneNode(true));

    this.currenFocusIndex;

    this.setAttribute('role', 'gridcell')
    this.setAttribute('tabindex', '-1')
    this.makeInert();

    this.addEventListener('focusin', (e) => {
      if (e.currentTarget.contains(e.relatedTarget)) {
		/* Focus was already in the container */
	  } else {
		/* Focus was received from outside the container */
        console.log('focus into grid')
	  }
    })

    this.addEventListener('focusout', (e) => {
      if (e.currentTarget.contains(e.relatedTarget)) {
          /* Focus will still be within the container */
      } else {
          /* Focus will leave the container */
          console.log('focus out  of item');
          this.makeInert();
          this.currentFocusIndex = undefined;
      }
    })

    this.addEventListener('keydown', (e) => {
      let shiftKey = e.shiftKey;
      switch (e.key) {
        case 'Tab':
          if(this.isInteractive){
            e.preventDefault();
            if(shiftKey) {
              this.focusPrev();
            } else {
              this.focusNext();
            }
          }
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          if(this.isInteractive) {
            this.focusNext();
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
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
            e.stopPropagation();
            console.log(e);
            const nextItem = this.parentElement.querySelector('#'+e.target.dataset.target);
            if(nextItem) {
              e.preventDefault();
              this.parentElement.focusItem(nextItem);
            }
          }
          break;
        default:
          break;
      }
    });

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

  get linkElement() {
    return this.querySelector('a');
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

}
customElements.define('flow-item', FlowItem)


