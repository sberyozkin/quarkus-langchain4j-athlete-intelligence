import {LitElement, html, css} from 'lit';

export class PeriodSelector extends LitElement {

    static properties = {
        selectedPeriod: {type: Number}
    }

    static styles = css`
      :host {
        display: block;
      }

      .period-selector {
        display: flex;
        gap: 0.5em;
        margin-bottom: 1.5em;
      }

      button {
        padding: 0.5em 1em;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Red Hat Text', sans-serif;
        color: #666;
      }

      button:hover {
        border-color: var(--main-highlight-text-color);
        color: var(--main-highlight-text-color);
      }

      button.active {
        background: var(--main-highlight-text-color);
        border-color: var(--main-highlight-text-color);
        color: white;
      }
    `

    constructor() {
        super();
        this.selectedPeriod = 30;
    }

    render() {
        return html`
            <div class="period-selector">
                <button 
                    class="${this.selectedPeriod === 7 ? 'active' : ''}"
                    @click=${() => this._selectPeriod(7)}>
                    7 days
                </button>
                <button 
                    class="${this.selectedPeriod === 30 ? 'active' : ''}"
                    @click=${() => this._selectPeriod(30)}>
                    30 days
                </button>
                <button 
                    class="${this.selectedPeriod === 90 ? 'active' : ''}"
                    @click=${() => this._selectPeriod(90)}>
                    90 days
                </button>
            </div>
        `
    }

    _selectPeriod(days) {
        this.selectedPeriod = days;
        this.dispatchEvent(new CustomEvent('period-changed', {
            detail: { days },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('period-selector', PeriodSelector);
