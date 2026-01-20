import {LitElement, html, css} from 'lit';
import './athlete-snapshot-header.js';
import './context-panel.js';
import './main-canvas.js';
import './context-chat-input.js';

export class AthleteDashboard extends LitElement {

    static properties = {
        userName: {type: String},
        connected: {type: Boolean}
    }

    static styles = css`
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }

      .dashboard {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      .content-area {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .left-panel {
        width: 300px;
        flex-shrink: 0;
        overflow-y: auto;
      }

      .main-area {
        flex: 1;
        overflow: hidden;
      }
    `

    constructor() {
        super();
        this.userName = '';
        this.connected = false;
        this.socket = null;
        this.mainCanvas = null;
        this.chatInput = null;
    }

    firstUpdated() {
        this.mainCanvas = this.shadowRoot.querySelector('main-canvas');
        this.chatInput = this.shadowRoot.querySelector('context-chat-input');
        const contextPanel = this.shadowRoot.querySelector('context-panel');
        this._connectWebSocket();
        
        // Listen for view changes from context panel
        if (contextPanel) {
            contextPanel.addEventListener('view-changed', (e) => {
                if (this.mainCanvas) {
                    this.mainCanvas.currentView = e.detail.view;
                }
                // Update context panel active view
                contextPanel.activeView = e.detail.view;
            });
        }
        
        // Focus chat input after a short delay
        setTimeout(() => {
            if (this.chatInput) {
                this.chatInput.focus();
            }
        }, 500);
    }

    _connectWebSocket() {
        const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
        this.socket = new WebSocket(wsProtocol + window.location.host + "/fitnessAdviser");
        
        this.socket.onopen = () => {
            this.connected = true;
            if (this.chatInput) {
                this.chatInput.disabled = false;
            }
        };

        this.socket.onmessage = (event) => {
            const response = event.data;
            if (this.mainCanvas) {
                this.mainCanvas.updateCommentary(response);
            }
            if (this.chatInput) {
                this.chatInput.disabled = false;
                // Refocus input after response
                setTimeout(() => this.chatInput.focus(), 100);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (this.chatInput) {
                this.chatInput.disabled = false;
            }
        };

        this.socket.onclose = () => {
            this.connected = false;
            if (this.chatInput) {
                this.chatInput.disabled = true;
            }
        };

        // Listen for messages from chat input
        this.addEventListener('message-sent', this._handleMessageSent.bind(this));
        // Listen for AI query requests (e.g., from calendar clicks)
        this.addEventListener('ai-query-requested', this._handleAiQueryRequest.bind(this));
    }

    _handleAiQueryRequest(e) {
        const question = e.detail.question;
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(question);
            if (this.chatInput) {
                this.chatInput.disabled = true;
            }
            // Show loading state in commentary
            if (this.mainCanvas) {
                this.mainCanvas.updateCommentary('Thinking...');
            }
        } else {
            // If WebSocket not ready, show message
            if (this.mainCanvas) {
                this.mainCanvas.updateCommentary('Connection not ready. Please wait a moment and try again.');
            }
        }
    }

    _handleMessageSent(e) {
        const message = e.detail.message;
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
            if (this.chatInput) {
                this.chatInput.disabled = true;
            }
            // Show loading state in commentary
            if (this.mainCanvas) {
                this.mainCanvas.updateCommentary('Thinking...');
            }
        }
    }

    disconnectedCallback() {
        if (this.socket) {
            this.socket.close();
        }
    }

    render() {
        return html`
            <div class="dashboard">
                <athlete-snapshot-header></athlete-snapshot-header>
                
                <div class="content-area">
                    <div class="left-panel">
                        <context-panel></context-panel>
                    </div>
                    
                    <div class="main-area">
                        <main-canvas></main-canvas>
                    </div>
                </div>

                <context-chat-input ?disabled=${!this.connected}></context-chat-input>
            </div>
        `
    }
}

customElements.define('athlete-dashboard', AthleteDashboard);
