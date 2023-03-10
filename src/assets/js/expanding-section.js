import UUIDv4 from './utils/uuid.js';

class ExpandingSection extends HTMLElement {
  constructor(){
    super();
    const self = this;

    this.state = new Proxy(
      {
        status: 'open',
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

  }

  connectedCallback() {
    this.uuid = this.#generateUUID();
    this.panelId = `expanding-section-${this.uuid}`;
    this.initialMarkup = this.innerHTML;

    this.render();
  }

  render() {
    this.classList.add('expanding-section');

    this.afterRender();
  }

  afterRender() {
    this.trigger = this.querySelector('[data-element="expanding-section-trigger"]');
    this.panel = this.querySelector('[data-element="expanding-section-panel"]');

    if (this.trigger && this.panel) {
      this.panel.classList.add('expanding-section__panel');
      this.panel.id = this.panelId;

      this.#addButton();
      this.button = this.trigger.querySelector('button');

      this.button.addEventListener('click', event => {
        event.preventDefault();
        this.toggle();
      });

      this.toggle();

      return;
    }

    this.innerHTML = this.initialMarkup;
  }

  #addButton() {
    this.triggerMarkup = this.trigger.innerText;

    this.trigger.innerHTML = `
      <button class="expanding-section__trigger" type="button" aria-controls="${this.panelId}">${this.triggerMarkup}</button>
    `;
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
    this.setAttribute('status', this.state.status);

    switch (this.state.status) {
      case 'open':
        this.trigger.setAttribute('aria-expanded', 'true');
        break;
      case 'closed':
      case 'initial':
        this.trigger.setAttribute('aria-expanded', 'false');
        break;
    }
  }


  #generateUUID() {
    return UUIDv4.generate();
  }
}
if('customElements' in window) {
  customElements.define('expanding-section', ExpandingSection);
}
export default ExpandingSection;
