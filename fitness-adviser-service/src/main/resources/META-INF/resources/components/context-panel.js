import {LitElement, html, css} from 'lit';

export class ContextPanel extends LitElement {

    static properties = {
        activeView: {type: String}
    }

    static styles = css`
      :host {
        display: block;
        height: 100%;
      }

      .panel {
        background: white;
        border-right: 1px solid #e0e0e0;
        padding: 1.5em;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }

      .navigation {
        margin-bottom: 2em;
      }

      .nav-title {
        font-size: 14px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.75em;
      }

      .nav-item {
        display: block;
        padding: 0.75em 1em;
        margin-bottom: 0.5em;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 15px;
        color: #666;
        text-decoration: none;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-family: 'Red Hat Text', sans-serif;
      }

      .nav-item:hover {
        background: #f5f5f5;
        color: #333;
      }

      .nav-item.active {
        background: var(--main-highlight-text-color);
        color: white;
        font-weight: 600;
      }

      .section {
        margin-bottom: 2em;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.75em;
      }

      .section-content {
        font-size: 16px;
        color: #333;
      }

      .badge {
        display: inline-block;
        background: var(--main-highlight-text-color);
        color: white;
        padding: 0.4em 0.8em;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        margin: 0.25em 0.25em 0.25em 0;
      }

      .value {
        font-weight: 600;
        color: var(--main-highlight-text-color);
      }
    `

    constructor() {
        super();
        this.activeView = 'training-overview';
    }

    render() {
        return html`
            <div class="panel">
                <div class="navigation">
                    <div class="nav-title">Navigation</div>
                    <button 
                        class="nav-item ${this.activeView === 'training-overview' ? 'active' : ''}"
                        @click=${() => this._navigate('training-overview')}>
                        Training Overview
                    </button>
                    <button 
                        class="nav-item ${this.activeView === 'habit-calendar' ? 'active' : ''}"
                        @click=${() => this._navigate('habit-calendar')}>
                        Habit Calendar
                    </button>
                </div>

                <div class="section">
                    <div class="section-title">Period</div>
                    <div class="section-content">
                        <span class="value">Last 30 days</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Focus</div>
                    <div class="section-content">
                        <span class="badge">Running</span>
                        <span class="badge">Endurance</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Goals</div>
                    <div class="section-content">
                        <div>Weekly distance: <span class="value">50 km</span></div>
                        <div>Consistency: <span class="value">85%</span></div>
                    </div>
                </div>
            </div>
        `
    }

    _navigate(view) {
        this.activeView = view;
        this.dispatchEvent(new CustomEvent('view-changed', {
            detail: { view },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('context-panel', ContextPanel);
