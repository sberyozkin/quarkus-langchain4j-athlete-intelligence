import {LitElement, html, css} from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import './period-selector.js';
import './stats-cards.js';
import './habit-calendar.js';

export class MainCanvas extends LitElement {

    static properties = {
        aiCommentary: {type: String, reflect: true},
        trainingData: {type: Object},
        loading: {type: Boolean},
        currentView: {type: String}
    }

    static styles = css`
      :host {
        display: block;
        height: 100%;
      }

      .canvas {
        background: #f8f9fa;
        padding: 2em;
        height: 100%;
        box-sizing: border-box;
        overflow-y: auto;
      }

      .training-overview {
        background: white;
        border-radius: 8px;
        padding: 2em;
        margin-bottom: 1.5em;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .training-overview-title {
        font-size: 20px;
        font-weight: 700;
        color: #333;
        margin-bottom: 1.5em;
      }

      .ai-summary {
        background: #f8f9fa;
        border-left: 4px solid var(--main-highlight-text-color);
        border-radius: 6px;
        padding: 1em 1.5em;
        margin-top: 1.5em;
        font-size: 16px;
        color: #333;
        line-height: 1.6;
      }

      .loading {
        text-align: center;
        padding: 2em;
        color: #999;
      }

      .error {
        background: #fee;
        border-left: 4px solid #f00;
        border-radius: 6px;
        padding: 1em 1.5em;
        color: #c00;
        margin-bottom: 1em;
      }

      .ai-commentary {
        background: white;
        border-left: 4px solid var(--main-highlight-text-color);
        border-radius: 8px;
        padding: 1.5em;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin-top: 1.5em;
      }

      .ai-commentary-title {
        font-size: 14px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.75em;
      }

      .ai-commentary-content {
        font-size: 16px;
        color: #333;
        line-height: 1.6;
      }

      .ai-commentary-content.empty::before {
        content: "AI insights will appear here as you interact with your data...";
        color: #999;
        font-style: italic;
      }

      /* Markdown styling */
      .ai-commentary-content h1,
      .ai-commentary-content h2,
      .ai-commentary-content h3,
      .ai-commentary-content h4 {
        margin: 1em 0 0.5em 0;
        font-weight: 700;
        color: #333;
      }

      .ai-commentary-content h1 {
        font-size: 1.5em;
      }

      .ai-commentary-content h2 {
        font-size: 1.3em;
      }

      .ai-commentary-content h3 {
        font-size: 1.1em;
      }

      .ai-commentary-content p {
        margin: 0.75em 0;
      }

      .ai-commentary-content p:first-child {
        margin-top: 0;
      }

      .ai-commentary-content p:last-child {
        margin-bottom: 0;
      }

      .ai-commentary-content strong {
        font-weight: 700;
        color: #222;
      }

      .ai-commentary-content em {
        font-style: italic;
      }

      .ai-commentary-content ul,
      .ai-commentary-content ol {
        margin: 0.75em 0;
        padding-left: 1.5em;
      }

      .ai-commentary-content li {
        margin: 0.5em 0;
      }

      .ai-commentary-content code {
        background: #f5f5f5;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Red Hat Mono', monospace;
        font-size: 0.9em;
      }

      .ai-commentary-content pre {
        background: #f5f5f5;
        padding: 1em;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1em 0;
      }

      .ai-commentary-content pre code {
        background: none;
        padding: 0;
      }

      .ai-commentary-content blockquote {
        border-left: 4px solid var(--main-highlight-text-color);
        padding-left: 1em;
        margin: 1em 0;
        color: #666;
        font-style: italic;
      }
    `

    constructor() {
        super();
        this.aiCommentary = '';
        this.trainingData = null;
        this.loading = true;
        this.currentPeriod = 30;
        this.currentView = 'training-overview';
        
        // Configure marked options
        marked.setOptions({
            breaks: true, // Convert line breaks to <br>
            gfm: true, // GitHub Flavored Markdown
        });
    }

    firstUpdated() {
        this.loadTrainingOverview(this.currentPeriod);
        // Listen for period changes
        this.addEventListener('period-changed', (e) => {
            this.currentPeriod = e.detail.days;
            this.loadTrainingOverview(this.currentPeriod);
        });
        // Listen for view changes
        this.addEventListener('view-changed', (e) => {
            this.currentView = e.detail.view;
        });
        // Listen for day selection from calendar
        this.addEventListener('day-selected', (e) => {
            this._handleDaySelected(e.detail);
        });
    }

    async _handleDaySelected(detail) {
        const { date, value, activities } = detail;
        const dateStr = new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Show loading state
        this.updateCommentary('Analyzing your activity...');
        
        // Build question with activity details including IDs
        if (activities && activities.length > 0) {
            const activityIds = activities.filter(a => a.id).map(a => a.id);
            
            if (activityIds.length > 0) {
                // Build a clear, directive question that explicitly instructs tool usage
                const idsList = activityIds.join(', ');
                const question = `On ${dateStr}, I completed ${activities.length} activity/activities totaling ${value} minutes. ` +
                    `I need you to use the athleteActivity tool to get detailed information about these activities. ` +
                    `The activity IDs are: ${idsList}. ` +
                    `Please call athleteActivity for each ID to retrieve the full activity details, then analyze my training patterns, intensity, performance metrics, and provide specific insights and recommendations for this day.`;
                
                // Dispatch event to parent dashboard to use existing WebSocket
                this.dispatchEvent(new CustomEvent('ai-query-requested', {
                    detail: { question },
                    bubbles: true,
                    composed: true
                }));
            } else {
                // Fallback if no IDs available
                const activityDetails = activities.map(a => {
                    const name = a.name || 'Activity';
                    const distance = a.distance ? `, ${(a.distance / 1000).toFixed(1)} km` : '';
                    const duration = a.duration ? `, ${Math.round(a.duration / 60)} min` : '';
                    return `${name}${distance}${duration}`;
                }).join('; ');
                
                const question = `Analyze my training on ${dateStr}. I had ${value} minutes of activity with ${activities.length} activity/activities: ${activityDetails}. ` +
                    `Provide insights about my training patterns and recommendations for this day.`;
                
                this.dispatchEvent(new CustomEvent('ai-query-requested', {
                    detail: { question },
                    bubbles: true,
                    composed: true
                }));
            }
        } else {
            // No activities on this day
            const question = `Tell me about my training on ${dateStr}. I had no recorded activities on this day. What does this rest day mean for my training pattern?`;
            
            this.dispatchEvent(new CustomEvent('ai-query-requested', {
                detail: { question },
                bubbles: true,
                composed: true
            }));
        }
    }

    async loadTrainingOverview(days) {
        this.loading = true;
        this.requestUpdate();
        
        try {
            const response = await fetch(`/api/training-overview?days=${days}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.error) {
                this.trainingData = { error: data.error };
            } else {
                this.trainingData = data;
                // Update period selector
                const periodSelector = this.shadowRoot.querySelector('period-selector');
                if (periodSelector) {
                    periodSelector.selectedPeriod = days;
                }
            }
        } catch (error) {
            this.trainingData = { error: `Failed to load training overview: ${error.message}` };
        } finally {
            this.loading = false;
            this.requestUpdate();
        }
    }

    render() {
        return html`
            <div class="canvas">
                ${this.currentView === 'training-overview' ? html`
                    <div class="training-overview">
                        <div class="training-overview-title">Training Overview</div>
                        
                        ${this.loading ? html`
                            <div class="loading">Loading training data...</div>
                        ` : html`
                            ${this.trainingData?.error ? html`
                                <div class="error">${this.trainingData.error}</div>
                            ` : html`
                                <period-selector .selectedPeriod=${this.currentPeriod}></period-selector>
                                
                                <stats-cards
                                    .activities=${this.trainingData?.stats?.activities || 0}
                                    .weeklyFrequency=${this.trainingData?.stats?.weeklyFrequency || 0}
                                    .distance=${this.trainingData?.stats?.distance || 0}
                                    .elevation=${this.trainingData?.stats?.elevation || 0}>
                                </stats-cards>
                                
                                ${this.trainingData?.summary ? html`
                                    <div class="ai-summary">
                                        ${this.trainingData.summary}
                                    </div>
                                ` : ''}
                            `}
                        `}
                    </div>
                ` : html`
                    <habit-calendar></habit-calendar>
                `}

                <div class="ai-commentary">
                    <div class="ai-commentary-title">AI Commentary</div>
                    <div class="ai-commentary-content ${!this.aiCommentary ? 'empty' : ''}">
                        ${!this.aiCommentary ? '' : unsafeHTML(marked.parse(this.aiCommentary))}
                    </div>
                </div>
            </div>
        `
    }

    updateCommentary(text) {
        this.aiCommentary = text || '';
        this.requestUpdate();
    }
}

customElements.define('main-canvas', MainCanvas);
