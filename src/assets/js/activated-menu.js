import getFocusableElements from './utils/get-focusable-elements.js';
import { tabbable } from './utils/tabbable.js';

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
    this.convertLinksToButtons();
    this.menuItemsMarkup = this.querySelector('[data-element="activated-menu-items"]').outerHTML;
    this.triggerMarkup = `
      <button class="activated-menu__trigger ${this.triggerClass}" data-element="activated-menu-trigger" type="button" aria-haspopup="menu">
        <span>${this.triggerLabel}</span>
      </button>`
    this.render();
  }

  disconnectedCallback() {

  }

  get triggerLabel() {
    const triggerElement = this.querySelector('[data-element="activated-menu-trigger"]');
    let triggerLabel;

    if(triggerElement) {
      triggerLabel = this.querySelector('[data-element="activated-menu-trigger"]').innerText;
    } else {
      triggerLabel = this.getAttribute('trigger-label') || 'Open';
    }

    return triggerLabel;
  }

  get triggerClass() {
    return this.getAttribute('trigger-class')
  }

  get items() {
    return this.querySelectorAll('li');
  }

  get isSubmenu() {
    return !!this.parentNode.closest('activated-menu');
  }

  convertLinksToButtons(){
    const links = this.querySelectorAll('a');
    links.forEach( (link) => {
      const button = document.createElement('button');
      button.setAttribute('type','button');
      this.cloneElementAttributes(link, button, ['href']);
      this.cloneElementDataset(link, button);
      button.innerHTML = link.innerHTML;
      link.replaceWith(button);
    });
  }

  cloneElementAttributes(source,target,exclude=[]){
    [...source.attributes].filter( attr => !exclude.includes(attr.nodeName) )
                          .forEach( attr => { target.setAttribute(attr.nodeName, attr.nodeValue) })
  }

  cloneElementDataset(source, target, exclude=[]) {
    let attributes = [];
    for( let attr in source.dataset) {
      attributes.push( [ attr,source.dataset[attr] ] );
    }
    attributes.filter( ([attr, _]) => { return !exclude.includes(attr)})
                       .forEach( ([attr, value]) => { target.dataset[attr] = value })
  }

  render() {
    this.innerHTML = `
      <div class="activated-menu" data-element="activated-menu-root" data-id="${this.getAttribute('id')}" status="${this.state.status}">
        ${this.triggerMarkup}
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
    this.focusableElements = this.querySelectorAll(':scope > ul li button:first-of-type');

    if (this.trigger && this.panel) {
      this.panel.querySelector('ul').setAttribute('role', 'menu')
      this.menuItems.forEach( item => item.setAttribute('role', 'menuitem'));

      this.trigger.addEventListener('click', event => {
        event.preventDefault();
        this.toggle();
      });

      this.trigger.addEventListener('keydown', event => {
        let key = event.key;
          switch(key) {
            case 'Enter':
              setTimeout(() => {
                this.focusItem(0);
              }, 50);
              break;
          }
      });

      this.trigger.addEventListener('keyup', event => {
          let key = event.key;
          switch(key) {
            case 'Space':
              setTimeout(() => {
                this.focusItem(0);
              }, 50);
              break;
          }
      });

      this.addEventListener('mouseover',(event) => {
        if(this.isSubmenu) {
          if(this.state.status === 'closed') {
            this.state.status = 'open';
          }
        }
      })

      this.addEventListener('mouseleave',(event) => {
        if(this.isSubmenu) {
          if(this.state.status === 'open') {
            this.state.status = 'closed';
          }
        }
      })

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
      case 'open':
        this.trigger.setAttribute('aria-expanded', 'true');
        this.panel.addEventListener('mouseleave', event => {
              setTimeout( (e) => {
                this.state.status = 'closed'
              }, 30);
        });
        break;
      case 'closed':
      case 'initial':
        this.trigger.setAttribute('aria-expanded', 'false');
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
    const item = this.menuItems.item(index).querySelector('button');

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
