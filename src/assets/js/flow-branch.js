import FlowItem from './flow-item.js';
import UUIDv4 from './utils/uuid.js';

class FlowBranch extends FlowItem {
  constructor(){
    super();
  }

  connectedCallback(){
    console.log('flow branch coinnected')
    this.uuid = this.#generateUUID();
    this.initialMarkup = this.innerHTML;
    this.thumbnailHTML = `
      <img usemap="#thumbnail-${this.uuid}" alt="" role="presentation" src="/assets/img/diamond.svg">
      <map name="thumbnail-${this.uuid}" aria-hidden="true">
        <area shape="poly" coords="0,72.5 100,0 200,72.5 100,145" alt="${this.title}" role="presentation" href="${this.href}" tabindex="-1">
      </map>`;
    this.diamondSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 125" tabindex="-1" focusable="false">
        <polygon fill="" points="1,62.5 100,1 199,62.5 100,124" stroke="" stroke-width="2"></polygon>
      </svg>
    `
    this.render();
  }

  render() {
    this.innerHTML = `
        ${this.thumbnailHTML}
        ${this.initialMarkup}
    `;

    this.afterRender();
  }

  afterRender() {
    this.setAttribute('role', 'gridcell')
    this.setAttribute('tabindex', '-1')
    this.classList.add('flow-item')
    this.classList.add('flow-branch')

    this.makeInert();
    this.#insertDiamondSVG();
    this.setBranchConditionPositions();

    this.addEventListener('focusin', this.onFocusIn);
    this.addEventListener('focusout', this.onFocusOut);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  #insertDiamondSVG() {
    const heading = this.querySelector('h2')
    const headingLink = heading.querySelector('a');
    const svg = this.#createDiamondSVG();

    headingLink.prepend(svg);
  }

  #createDiamondSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');;
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');;

    svg.setAttribute('viewBox', '0 0 200 125');
    svg.setAttribute('tabindex', '-1');
    svg.setAttribute('focusable', 'false');

    polygon.setAttribute('fill','');
    polygon.setAttribute('stroke','');
    polygon.setAttribute('stroke-width','2');
    polygon.setAttribute('points','1,62.5 100,1 199,62.5 100,124');

    svg.appendChild(polygon);
    return svg;
  }

  setBranchConditionPositions() {
    let conditions = this.querySelectorAll('ul.conditions > li');
    conditions.forEach( (condition) => {
      condition.style.setProperty("--row-index", condition.dataset.row - 1)
    })
  }

  #generateUUID() {
    return UUIDv4.generate();
  }

}
if ('customElements' in window) {
  customElements.define('flow-branch', FlowBranch)
}
export default FlowBranch;
