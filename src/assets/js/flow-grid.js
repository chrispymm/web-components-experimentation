class FlowGrid extends HTMLElement {
  constructor() {
    super()

    const template = document.querySelector('#flow-grid-template');
    const templateContent = template.content
    const shadowRoot = this.attachShadow({ mode: "open" });

    const style = document.createElement('style')
    style.textContent = `
      :host {
        background: red;
      }
      [role="row"] {
        position: relative;
      }
    `;

    shadowRoot.appendChild(templateContent.cloneNode(true));
    shadowRoot.appendChild(style)

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
