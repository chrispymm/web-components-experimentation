import getFocusableElements from './utils/get-focusable-elements.js';
import { tabbable } from 'tabbable';

class ActivatedMenu extends HTMLElement {

  constructor() {
    super();

    const self = this;

    this.state = new Proxy(
      {
        status: 'closed',
      },
      {
        set(state, key, value) {
          const oldValue = state[key];

          state[key] = value;
          if (oldValue !== value) {
            self.processStateChange();
          }
          return state;
        }
      }
    );

    this.currentFocusIndex = 0;
  }

  connectedCallback() {
    this.initialMarkup = this.innerHTML;
    this.menuItemsMarkup = this.querySelector('[data-element="activated-menu-items"]').outerHTML;
    this.render();
  }

  disconnectedCallback() {

  }

  get triggerLabel() {
    return this.getAttribute('trigger-label');
  }

  get items() {
    return this.querySelectorAll('li');
  }

  render() {
    this.innerHTML = `
      <div class="activated-menu" data-element="activated-menu-root">
        <button class="activated-menu__trigger" data-element="activated-menu-trigger" type="button" aria-haspopup="menu">
          <span>${this.triggerLabel}</span>
        </button>
        <div class="activated-menu__panel" data-element="activated-menu-panel">
          ${this.menuItemsMarkup}
        </div>
      </div>
    `

    this.afterRender();
  }

  afterRender() {
    this.trigger = this.querySelector('[data-element="activated-menu-trigger"]');
    this.panel = this.querySelector('[data-element="activated-menu-panel"]');
    this.root = this.querySelector('[data-element="activated-menu-root"]');
    this.menu = this.querySelector('[data-element="activated-menu-items"]');
    this.menuItems = this.menu.querySelectorAll(':scope > li');
    this.focusableElements = getFocusableElements(this);

    if (this.trigger && this.panel) {
      this.panel.querySelector('ul').setAttribute('role', 'menu')
      this.menuItems.forEach( item => item.setAttribute('role', 'menuitem'));

      this.toggle();

      this.trigger.addEventListener('click', event => {
        event.preventDefault();

        this.toggle();
      });

      this.root.addEventListener('keydown', event => {
        if(this.state.status === 'open') {
          event.stopPropagation();
          let key = event.key;
          let shiftKey = event.shiftKey;

          switch(key) {
            case 'Home':
              event.preventDefault();
              this.focus(0);
              break;
            case 'End':
              event.preventDefault();
              this.focusLast();
              break;
            case 'ArrowDown':
              event.preventDefault();
              this.focusNext();
              break;
            case 'ArrowUp':
              event.preventDefault();
              this.focusPrev();
              break;
            case 'Escape':
              this.toggle();
              this.trigger.focus();
              break;
            case 'Tab':
              event.preventDefault();
              // close will set focus on the activator by default, so we call first
              this.toggle();
              // now we can set the focus to the correct item
              let tabbableElements = tabbable(document, { displayCheck: 'full' })
              let index = tabbableElements.indexOf(this.trigger);
              // focus on the next/previous item after the activator node
              if( shiftKey ) {
                tabbableElements[index-1].focus();
              } else {
                tabbableElements[index+1].focus();
              }
              break;
          }
        }
      })

      return;
    }

    this.innerHTML = this.initialMarkup;
  }

  toggle(forcedStatus) {
    if (forcedStatus) {
      if (this.state.status === forcedStatus) {
        return;
      }

      this.state.status = forcedStatus;
    } else {
      this.state.status = this.state.status === 'closed' ? 'open' : 'closed';
    }
  }

  processStateChange() {
    this.root.setAttribute('status', this.state.status);

    this.manageFocus();

    switch (this.state.status) {
      case 'closed':
        this.trigger.setAttribute('aria-expanded', 'false');
        break;
      case 'open':
      case 'initial':
        this.trigger.setAttribute('aria-expanded', 'true');
        this.focusItem(0);
        break;
    }
  }

  manageFocus() {
    switch (this.state.status) {
      case 'open':
        this.focusableElements.forEach(element => element.removeAttribute('tabindex'));
        break;
      case 'closed':
        [...this.focusableElements]
          .filter(
            element => element.getAttribute('data-element') !== 'activated-menu-trigger'
          )
          .forEach(element => element.setAttribute('tabindex', '-1'));
        break;
    }
  }

  focusItem(index=0) {
    if(index > this.menuItems.length - 1) index = 0;
    if(index < 0 ) index = this.menuItems.length - 1;

    const item = this.menuItems.item(index).querySelector('a:first-child');

    if(item.hasAttribute('aria-disabled')) {
      // if item is disabled, skip it
      if( index > this.currentFocusIndex) {
        this.focus(index+1);
      } else {
        this.focus(index-1);
      }
    } else {
      this.currentFocusIndex = index;
      item.focus();
      //this.$node.attr('aria-activedescendant', $item.attr('id'));
    }
  }

  focusNext() {
    this.focusItem( this.currentFocusIndex + 1 );
  }

  focusPrev() {
    this.focusItem( this.currentFocusIndex - 1 );
  }

  focusLast() {
    this.focusItem( this.menuItems.length - 1);
  }
}

if ('customElements' in window) {
  customElements.define('activated-menu', ActivatedMenu);
}
export default ActivatedMenu
