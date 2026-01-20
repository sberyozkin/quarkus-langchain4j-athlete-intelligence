import {LitElement, html, css} from 'lit';

export class HabitCalendar extends LitElement {

    static properties = {
        calendarData: {type: Object},
        loading: {type: Boolean}
    }

    static styles = css`
      :host {
        display: block;
      }

      .calendar-container {
        background: white;
        border-radius: 8px;
        padding: 2em;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .calendar-title {
        font-size: 20px;
        font-weight: 700;
        color: #333;
        margin-bottom: 1.5em;
      }

      .calendar-heatmap {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
        margin-bottom: 1em;
      }

      .day-cell {
        width: 11px;
        height: 11px;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }

      .day-cell:hover {
        transform: scale(1.3);
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .day-cell.level-0 {
        background: #ebedf0;
      }

      .day-cell.level-1 {
        background: #9be9a8;
      }

      .day-cell.level-2 {
        background: #40c463;
      }

      .day-cell.level-3 {
        background: #30a14e;
      }

      .day-cell.level-4 {
        background: #216e39;
      }

      .calendar-legend {
        display: flex;
        align-items: center;
        gap: 0.5em;
        font-size: 12px;
        color: #666;
        margin-top: 1em;
      }

      .legend-label {
        margin-right: 0.5em;
      }

      .legend-cells {
        display: flex;
        gap: 3px;
      }

      .legend-cell {
        width: 11px;
        height: 11px;
        border-radius: 2px;
      }

      .legend-text {
        margin-left: 0.5em;
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

    `

    constructor() {
        super();
        this.calendarData = null;
        this.loading = true;
    }

    firstUpdated() {
        this.loadCalendarData();
    }

    async loadCalendarData() {
        this.loading = true;
        this.requestUpdate();
        
        try {
            const response = await fetch('/api/calendar-data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.error) {
                this.calendarData = { error: data.error };
            } else {
                this.calendarData = data;
            }
        } catch (error) {
            this.calendarData = { error: `Failed to load calendar data: ${error.message}` };
        } finally {
            this.loading = false;
            this.requestUpdate();
        }
    }

    _getLevel(value, maxValue) {
        if (!value || value === 0) return 0;
        const ratio = value / maxValue;
        if (ratio < 0.2) return 1;
        if (ratio < 0.4) return 2;
        if (ratio < 0.7) return 3;
        return 4;
    }

    _handleDayClick(day) {
        if (day && day.value > 0) {
            this.dispatchEvent(new CustomEvent('day-selected', {
                detail: { 
                    date: day.date,
                    value: day.value,
                    activities: day.activities || []
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    render() {
        if (this.loading) {
            return html`
                <div class="calendar-container">
                    <div class="calendar-title">Habit Calendar</div>
                    <div class="loading">Loading calendar data...</div>
                </div>
            `;
        }

        if (this.calendarData?.error) {
            return html`
                <div class="calendar-container">
                    <div class="calendar-title">Habit Calendar</div>
                    <div class="error">${this.calendarData.error}</div>
                </div>
            `;
        }

        const days = this.calendarData?.days || [];
        const maxValue = Math.max(...days.map(d => d.value || 0), 1);

        // Group days by month for labels (show first day of each month)
        const monthLabels = [];
        let currentMonth = null;
        days.forEach((day, index) => {
            if (day.date) {
                const date = new Date(day.date);
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                if (month !== currentMonth) {
                    monthLabels.push({ index, month });
                    currentMonth = month;
                }
            }
        });

        return html`
            <div class="calendar-container">
                <div class="calendar-title">Habit Calendar</div>

                <div class="calendar-heatmap">
                    ${days.map((day, index) => {
                        const level = this._getLevel(day.value, maxValue);
                        const dateStr = day.date ? new Date(day.date).toLocaleDateString() : '';
                        return html`
                            <div 
                                class="day-cell level-${level}"
                                title="${dateStr}: ${day.value || 0} minutes"
                                @click=${() => this._handleDayClick(day)}>
                            </div>
                        `;
                    })}
                </div>

                <div class="calendar-legend">
                    <span class="legend-label">Less</span>
                    <div class="legend-cells">
                        <div class="legend-cell level-0"></div>
                        <div class="legend-cell level-1"></div>
                        <div class="legend-cell level-2"></div>
                        <div class="legend-cell level-3"></div>
                        <div class="legend-cell level-4"></div>
                    </div>
                    <span class="legend-text">More</span>
                </div>
            </div>
        `
    }
}

customElements.define('habit-calendar', HabitCalendar);
