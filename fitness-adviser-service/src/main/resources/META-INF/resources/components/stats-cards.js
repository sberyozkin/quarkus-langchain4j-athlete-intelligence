import {LitElement, html, css} from 'lit';

export class StatsCards extends LitElement {

    static properties = {
        activities: {type: Number},
        weeklyFrequency: {type: Number},
        distance: {type: Number},
        elevation: {type: Number}
    }

    static styles = css`
      :host {
        display: block;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1em;
        margin-bottom: 1.5em;
      }

      .stat-card {
        background: white;
        border-radius: 8px;
        padding: 1.5em;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .stat-label {
        font-size: 12px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5em;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--main-highlight-text-color);
      }

      .stat-unit {
        font-size: 14px;
        color: #999;
        font-weight: 400;
        margin-left: 0.25em;
      }
    `

    constructor() {
        super();
        this.activities = 0;
        this.weeklyFrequency = 0;
        this.distance = 0;
        this.elevation = 0;
    }

    render() {
        return html`
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Activities</div>
                    <div class="stat-value">${this.activities}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Weekly Frequency</div>
                    <div class="stat-value">${this.weeklyFrequency.toFixed(1)}<span class="stat-unit">/week</span></div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Distance</div>
                    <div class="stat-value">${this.distance.toFixed(1)}<span class="stat-unit">km</span></div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Elevation</div>
                    <div class="stat-value">${Math.round(this.elevation)}<span class="stat-unit">m</span></div>
                </div>
            </div>
        `
    }
}

customElements.define('stats-cards', StatsCards);
