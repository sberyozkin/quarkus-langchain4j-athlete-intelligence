import {LitElement, html, css} from 'lit';

export class ContextChatInput extends LitElement {

    static properties = {
        disabled: {type: Boolean}
    }

    static styles = css`
      :host {
        display: block;
        width: 100%;
      }

      .chat-container {
        background: white;
        border-top: 1px solid #e0e0e0;
        padding: 1.5em 2em;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
      }

      .chat-label {
        font-size: 14px;
        font-weight: 600;
        color: #666;
        margin-bottom: 0.75em;
        display: block;
      }

      .input-container {
        display: flex;
        gap: 1em;
        align-items: center;
      }

      .input-wrapper {
        flex: 1;
        position: relative;
      }

      input {
        width: 100%;
        padding: 0.75em 1em;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        font-family: 'Red Hat Text', sans-serif;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }

      input:focus {
        outline: none;
        border-color: var(--main-highlight-text-color);
      }

      input:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
      }

      button {
        background: var(--main-highlight-text-color);
        color: white;
        border: none;
        padding: 0.75em 2em;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
        font-family: 'Red Hat Text', sans-serif;
      }

      button:hover:not(:disabled) {
        background: #ff9500;
      }

      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    `

    constructor() {
        super();
        this.disabled = false;
    }

    render() {
        return html`
            <div class="chat-container">
                <label class="chat-label">Ask a question about this view</label>
                <div class="input-container">
                    <div class="input-wrapper">
                        <input 
                            type="text" 
                            id="chatInput"
                            placeholder="e.g., What trends do you see in my running?"
                            ?disabled=${this.disabled}
                            @keypress=${this._handleKeyPress}
                        />
                    </div>
                    <button ?disabled=${this.disabled} @click=${this._handleSend}>
                        Send
                    </button>
                </div>
            </div>
        `
    }

    _handleKeyPress(e) {
        if (e.key === 'Enter' && !this.disabled) {
            this._handleSend();
        }
    }

    _handleSend() {
        const input = this.shadowRoot.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message && !this.disabled) {
            this.dispatchEvent(new CustomEvent('message-sent', {
                detail: { message },
                bubbles: true,
                composed: true
            }));
            input.value = '';
        }
    }

    focus() {
        const input = this.shadowRoot.getElementById('chatInput');
        if (input) {
            input.focus();
        }
    }
}

customElements.define('context-chat-input', ContextChatInput);
