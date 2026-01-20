import {LitElement, html, css} from 'lit';

export class AthleteSnapshotHeader extends LitElement {

    static styles = css`
      :host {
        display: block;
        width: 100%;
      }

      .header {
        background: linear-gradient(135deg, var(--main-highlight-text-color) 0%, #ff9500 100%);
        color: white;
        padding: 1.5em 2em;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 1.5em;
      }

      .header-content {
        flex: 1;
      }

      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        font-family: 'Red Hat Text', sans-serif;
      }

      .header .subtitle {
        margin: 0.5em 0 0 0;
        font-size: 16px;
        opacity: 0.95;
        font-weight: 400;
      }

      .header-image {
        height: 60px;
        width: auto;
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      .header-image img {
        height: 100%;
        width: auto;
        /* Recolor SVG to white: brightness(0) makes it black, invert(1) makes it white */
        filter: brightness(0) invert(1);
      }
    `

    render() {
        return html`
            <div class="header">
                <div class="header-image">
                    <img src="images/jfokus-simple-2026.svg" alt="JFokus 2026" />
                </div>
                <div class="header-content">
                    <h1>Athlete Snapshot</h1>
                    <div class="subtitle">Last 30 days · Running focused · Consistent</div>
                </div>
            </div>
        `
    }
}

customElements.define('athlete-snapshot-header', AthleteSnapshotHeader);
