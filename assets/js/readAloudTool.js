// readAloudTool.js - Screen Reader Tool for Assessment Portal

class ReadAloudTool {
    constructor(options = {}) {
        // Configuration options
        this.accessCode = options.accessCode || 'reader123';
        this.defaultVoice = options.defaultVoice || 'en-US';
        this.defaultRate = options.defaultRate || 1.0;
        this.defaultPitch = options.defaultPitch || 1.0;
        this.defaultVolume = options.defaultVolume || 1.0;

        this.isActive = false;
        this.authenticated = false;
        this.speaking = false;
        this.paused = false;
        this.currentText = '';
        this.availableVoices = [];

        // Initialize Speech Synthesis API
        this.synth = window.speechSynthesis;

        // Initialize components
        this.init();
    }

    init() {
        this.createStyles();
        this.loadVoices();

        // Handle voices loaded if they load asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = this.loadVoices.bind(this);
        }
    }

    // Load available voices from the browser
    loadVoices() {
        this.availableVoices = this.synth.getVoices();
        console.log(`Loaded ${this.availableVoices.length} voices for text-to-speech`);
    }

    // Add required CSS styles
    createStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
      .reader-panel {
        position: fixed;
        left: 20px;
        bottom: 20px;
        width: 320px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9995;
        overflow: hidden;
        display: none;
      }
      
      .reader-panel.active {
        display: block;
      }
      
      .reader-header {
        padding: 12px 15px;
        background: #0a2b72;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }
      
      .reader-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .reader-controls {
        display: flex;
        gap: 8px;
      }
      
      .reader-btn {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .reader-content {
        padding: 15px;
      }
      
      .reader-textarea {
        width: 100%;
        height: 100px;
        padding: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        resize: none;
        font-size: 14px;
        margin-bottom: 10px;
      }
      
      .reader-options {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .reader-option-group {
        display: flex;
        flex-direction: column;
        min-width: 120px;
      }
      
      .reader-option-group label {
        font-size: 12px;
        margin-bottom: 5px;
        color: #4b5563;
      }
      
      .reader-option-group select,
      .reader-option-group input {
        padding: 5px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .reader-action-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }
      
      .reader-action-btn {
        flex: 1;
        padding: 8px 0;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }
      
      .reader-action-btn svg {
        width: 16px;
        height: 16px;
      }
      
      .reader-action-btn.primary {
        background-color: #0a2b72;
        color: white;
      }
      
      .reader-action-btn.secondary {
        background-color: #f3f4f6;
        border: 1px solid #e5e7eb;
        color: #374151;
      }
      
      .reader-action-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .reader-footer {
        padding: 10px 15px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #6b7280;
        display: flex;
        justify-content: space-between;
      }
      
      .reader-highlight {
        background-color: rgba(59, 130, 246, 0.2);
        outline: 2px solid rgba(59, 130, 246, 0.3);
      }
      
      .reader-selection-popup {
        position: absolute;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 14px;
        cursor: pointer;
        z-index: 9998;
      }
      
      .reader-auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      }
      
      .reader-auth-content {
        background: white;
        border-radius: 8px;
        padding: 20px;
        width: 90%;
        max-width: 350px;
      }
      
      .reader-auth-content h3 {
        margin-top: 0;
      }
      
      .reader-auth-input {
        width: 100%;
        padding: 8px;
        margin: 10px 0;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
      }
      
      .reader-auth-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
      }
      
      .reader-auth-btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .reader-auth-submit {
        background: #0a2b72;
        color: white;
        border: none;
      }
      
      .reader-auth-cancel {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
      }
    `;

        document.head.appendChild(styleEl);
    }

    // Show authentication modal
    showAuthModal() {
        const modal = document.createElement('div');
        modal.className = 'reader-auth-modal';
        modal.innerHTML = `
      <div class="reader-auth-content">
        <h3>Enter Read Aloud Tool Access Code</h3>
        <input type="password" class="reader-auth-input" id="reader-auth-input" placeholder="Enter access code">
        <div class="reader-auth-buttons">
          <button class="reader-auth-btn reader-auth-submit" id="reader-auth-submit">Submit</button>
          <button class="reader-auth-btn reader-auth-cancel" id="reader-auth-cancel">Cancel</button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        // Focus on input
        setTimeout(() => {
            document.getElementById('reader-auth-input').focus();
        }, 100);

        // Add event listeners
        document.getElementById('reader-auth-submit').addEventListener('click', () => {
            const code = document.getElementById('reader-auth-input').value;
            this.verifyAccessCode(code, modal);
        });

        document.getElementById('reader-auth-cancel').addEventListener('click', () => {
            modal.remove();
        });

        // Allow Enter key
        document.getElementById('reader-auth-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const code = document.getElementById('reader-auth-input').value;
                this.verifyAccessCode(code, modal);
            }
        });
    }

    // Verify the entered access code
    verifyAccessCode(code, modal) {
        if (code === this.accessCode) {
            this.authenticated = true;
            modal.remove();
            this.activate();
        } else {
            alert('Invalid access code. Please try again.');
        }
    }

    // Activate the read aloud tool
    activate() {
        if (!this.authenticated) {
            this.showAuthModal();
            return;
        }

        if (this.isActive) {
            return; // Already active
        }

        this.isActive = true;
        this.createReaderPanel();
        this.setupSelectionListener();
    }

    // Deactivate the read aloud tool
    deactivate() {
        this.isActive = false;

        // Stop any ongoing speech
        if (this.speaking) {
            this.synth.cancel();
            this.speaking = false;
            this.paused = false;
        }

        // Remove panel if it exists
        const panel = document.querySelector('.reader-panel');
        if (panel) {
            panel.remove();
        }

        // Remove any popup
        const popup = document.querySelector('.reader-selection-popup');
        if (popup) {
            popup.remove();
        }

        // Remove selection listener
        document.removeEventListener('mouseup', this.handleSelection);
    }

    // Create the main reader panel
    createReaderPanel() {
        const panel = document.createElement('div');
        panel.className = 'reader-panel active';

        let voiceOptions = '';
        // Filter for voices that support English or are the default
        const englishVoices = this.availableVoices.filter(voice =>
            voice.lang.includes('en') || voice.default
        );

        // Create voice options, prioritizing English voices
        if (englishVoices.length > 0) {
            englishVoices.forEach(voice => {
                voiceOptions += `<option value="${voice.name}" ${voice.default ? 'selected' : ''}>${voice.name} (${voice.lang})</option>`;
            });
        } else {
            // Fallback to all voices if no English voices are available
            this.availableVoices.forEach(voice => {
                voiceOptions += `<option value="${voice.name}" ${voice.default ? 'selected' : ''}>${voice.name} (${voice.lang})</option>`;
            });
        }

        panel.innerHTML = `
      <div class="reader-header">
        <h3>Read Aloud Tool</h3>
        <div class="reader-controls">
          <button class="reader-btn reader-minimize" title="Minimize">_</button>
          <button class="reader-btn reader-close" title="Close">×</button>
        </div>
      </div>
      <div class="reader-content">
        <div>
          <textarea class="reader-textarea" id="reader-text" placeholder="Select text from the assessment or type/paste text here to be read aloud..."></textarea>
        </div>
        <div class="reader-options">
          <div class="reader-option-group">
            <label for="reader-voice">Voice</label>
            <select id="reader-voice">
              ${voiceOptions}
            </select>
          </div>
          <div class="reader-option-group">
            <label for="reader-rate">Speed</label>
            <input type="range" id="reader-rate" min="0.5" max="2" step="0.1" value="${this.defaultRate}">
          </div>
          <div class="reader-option-group">
            <label for="reader-pitch">Pitch</label>
            <input type="range" id="reader-pitch" min="0.5" max="2" step="0.1" value="${this.defaultPitch}">
          </div>
        </div>
        <div class="reader-action-buttons">
          <button class="reader-action-btn primary" id="reader-play">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Play
          </button>
          <button class="reader-action-btn secondary" id="reader-pause" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            Pause
          </button>
          <button class="reader-action-btn secondary" id="reader-stop" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            Stop
          </button>
        </div>
      </div>
      <div class="reader-footer">
        <span>Text-to-Speech</span>
        <span id="reader-status">Ready</span>
      </div>
    `;

        document.body.appendChild(panel);

        // Make panel draggable
        this.makeDraggable(panel);

        // Setup event listeners
        this.setupPanelListeners(panel);
    }

    // Setup event listeners for the panel
    setupPanelListeners(panel) {
        // Close button
        panel.querySelector('.reader-close').addEventListener('click', () => {
            this.deactivate();
        });

        // Minimize button
        panel.querySelector('.reader-minimize').addEventListener('click', () => {
            panel.classList.toggle('active');

            // Change button text based on state
            const btn = panel.querySelector('.reader-minimize');
            btn.textContent = panel.classList.contains('active') ? '_' : '□';
            btn.title = panel.classList.contains('active') ? 'Minimize' : 'Maximize';
        });

        // Play button
        panel.querySelector('#reader-play').addEventListener('click', () => {
            const text = panel.querySelector('#reader-text').value.trim();
            if (text) {
                if (this.paused) {
                    this.resumeSpeech();
                } else {
                    this.speak(text);
                }
            } else {
                panel.querySelector('#reader-status').textContent = 'No text to read';
                setTimeout(() => {
                    panel.querySelector('#reader-status').textContent = 'Ready';
                }, 2000);
            }
        });

        // Pause button
        panel.querySelector('#reader-pause').addEventListener('click', () => {
            if (this.speaking) {
                if (this.paused) {
                    this.resumeSpeech();
                } else {
                    this.pauseSpeech();
                }
            }
        });

        // Stop button
        panel.querySelector('#reader-stop').addEventListener('click', () => {
            this.stopSpeech();
        });

        // Handle voice, rate, pitch changes
        panel.querySelector('#reader-voice').addEventListener('change', () => {
            if (this.speaking && !this.paused) {
                // If currently speaking, restart with new voice
                const text = this.currentText;
                this.stopSpeech();
                setTimeout(() => {
                    this.speak(text);
                }, 100);
            }
        });

        // Speed and pitch sliders
        const rateControl = panel.querySelector('#reader-rate');
        rateControl.addEventListener('change', () => {
            this.defaultRate = parseFloat(rateControl.value);
            panel.querySelector('#reader-status').textContent = `Speed: ${this.defaultRate.toFixed(1)}x`;
            setTimeout(() => {
                panel.querySelector('#reader-status').textContent = 'Ready';
            }, 1000);
        });

        const pitchControl = panel.querySelector('#reader-pitch');
        pitchControl.addEventListener('change', () => {
            this.defaultPitch = parseFloat(pitchControl.value);
            panel.querySelector('#reader-status').textContent = `Pitch: ${this.defaultPitch.toFixed(1)}`;
            setTimeout(() => {
                panel.querySelector('#reader-status').textContent = 'Ready';
            }, 1000);
        });
    }

    // Make an element draggable
    makeDraggable(element) {
        const header = element.querySelector('.reader-header');
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;

            // Add event listeners for dragging
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', () => {
                isDragging = false;
                document.removeEventListener('mousemove', handleMouseMove);
            });
        });

        function handleMouseMove(e) {
            if (isDragging) {
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;

                // Ensure the panel stays within viewport
                const maxX = window.innerWidth - element.offsetWidth;
                const maxY = window.innerHeight - element.offsetHeight;

                element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
                element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
            }
        }
    }

    // Setup text selection listener
    setupSelectionListener() {
        this.handleSelection = () => {
            if (!this.isActive) return;

            const selection = window.getSelection();
            if (!selection.toString().trim()) return;

            try {
                // Get selection coordinates
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Get selected text
                const text = selection.toString().trim();

                // Update text in panel
                const panel = document.querySelector('.reader-panel');
                if (panel) {
                    panel.querySelector('#reader-text').value = text;
                }

                // Show popup for quick reading
                this.showReadPopup(text, rect);
            } catch (e) {
                console.error('Error handling selection', e);
            }
        };

        document.addEventListener('mouseup', this.handleSelection);
    }

    // Show popup for quick reading of selected text
    showReadPopup(text, rect) {
        // Remove existing popup
        const existingPopup = document.querySelector('.reader-selection-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create new popup
        const popup = document.createElement('div');
        popup.className = 'reader-selection-popup';
        popup.innerHTML = `<span>🔊 Read Aloud</span>`;

        // Position the popup near the selection
        popup.style.left = `${rect.left + window.scrollX}px`;
        popup.style.top = `${rect.bottom + window.scrollY + 5}px`;

        document.body.appendChild(popup);

        // Ensure popup stays in viewport
        const popupRect = popup.getBoundingClientRect();
        if (popupRect.right > window.innerWidth) {
            popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
        }
        if (popupRect.bottom > window.innerHeight) {
            popup.style.top = `${rect.top + window.scrollY - popupRect.height - 5}px`;
        }

        // Add click event
        popup.addEventListener('click', () => {
            this.speak(text);
            popup.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(popup)) {
                popup.remove();
            }
        }, 5000);
    }

    // Start speaking the text
    speak(text) {
        if (!this.synth) {
            alert('Your browser does not support text-to-speech functionality');
            return;
        }

        // Stop any current speech
        if (this.speaking) {
            this.synth.cancel();
        }

        // Store current text
        this.currentText = text;

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // Get selected voice
        const voiceSelect = document.querySelector('#reader-voice');
        if (voiceSelect) {
            const selectedVoice = this.availableVoices.find(voice => voice.name === voiceSelect.value);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        // Set speech properties
        utterance.rate = this.defaultRate;
        utterance.pitch = this.defaultPitch;
        utterance.volume = this.defaultVolume;

        // Event handlers
        utterance.onstart = () => {
            this.speaking = true;
            this.paused = false;
            this.updateControlStates();
            document.querySelector('#reader-status').textContent = 'Speaking...';
        };

        utterance.onend = () => {
            this.speaking = false;
            this.paused = false;
            this.updateControlStates();
            document.querySelector('#reader-status').textContent = 'Ready';
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event.error);
            this.speaking = false;
            this.paused = false;
            this.updateControlStates();
            document.querySelector('#reader-status').textContent = `Error: ${event.error}`;
        };

        // Start speaking
        this.synth.speak(utterance);
    }

    // Pause speech
    pauseSpeech() {
        if (this.speaking && !this.paused) {
            this.synth.pause();
            this.paused = true;
            this.updateControlStates();
            document.querySelector('#reader-status').textContent = 'Paused';
            document.querySelector('#reader-pause').textContent = 'Resume';
        }
    }

    // Resume speech
    resumeSpeech() {
        if (this.paused) {
            this.synth.resume();
            this.paused = false;
            this.updateControlStates();
            document.querySelector('#reader-status').textContent = 'Speaking...';
            document.querySelector('#reader-pause').textContent = 'Pause';
        }
    }

    // Stop speech
    stopSpeech() {
        this.synth.cancel();
        this.speaking = false;
        this.paused = false;
        this.updateControlStates();
        document.querySelector('#reader-status').textContent = 'Stopped';
        setTimeout(() => {
            document.querySelector('#reader-status').textContent = 'Ready';
        }, 1000);
    }

    // Update the enabled/disabled state of control buttons
    updateControlStates() {
        const playBtn = document.querySelector('#reader-play');
        const pauseBtn = document.querySelector('#reader-pause');
        const stopBtn = document.querySelector('#reader-stop');

        if (this.speaking) {
            playBtn.disabled = this.paused ? false : true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        } else {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
        }

        // Update pause button text
        if (pauseBtn) {
            pauseBtn.innerHTML = this.paused
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Resume`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Pause`;
        }
    }

    // Extract text from assessment content
    extractTextFromAssessment() {
        try {
            // Try to access the display frame
            const displayFrame = document.getElementById('displayFrame');
            if (!displayFrame) return null;

            let frameDocument;
            try {
                // Try to access the content document
                frameDocument = displayFrame.contentDocument || displayFrame.contentWindow.document;
            } catch (e) {
                console.error('Cannot access iframe content due to same-origin policy', e);
                return null;
            }

            // Extract text from the document body
            if (frameDocument && frameDocument.body) {
                return frameDocument.body.textContent;
            }

            return null;
        } catch (e) {
            console.error('Error extracting text from assessment', e);
            return null;
        }
    }

    // Handle reading the entire assessment
    readEntireAssessment() {
        const text = this.extractTextFromAssessment();
        if (text) {
            this.speak(text);
        } else {
            alert('Could not access assessment content. This may be due to security restrictions or the content structure.');
        }
    }
}

// Function to add read aloud tool to existing accessibility menu
function addReadAloudToAccessibilityMenu() {
    // Create the read aloud tool instance
    const readAloudTool = new ReadAloudTool({
        accessCode: 'reader123'
    });

    // Find the existing accessibility toggle button
    const existingToggle = document.getElementById('accessibilityToggle');
    if (!existingToggle) {
        console.error('Accessibility toggle button not found');
        return;
    }

    // Find or create the accessibility panel
    let accessibilityPanel = document.querySelector('.accessibility-panel');
    if (!accessibilityPanel) {
        accessibilityPanel = document.createElement('div');
        accessibilityPanel.className = 'accessibility-panel';
        existingToggle.parentNode.appendChild(accessibilityPanel);
    }

    // Check if read aloud button already exists
    const existingButton = accessibilityPanel.querySelector('#readAloudBtn');
    if (existingButton) {
        // Update existing button
        existingButton.onclick = () => readAloudTool.activate();
    } else {
        // Create new button
        const readAloudButton = document.createElement('button');
        readAloudButton.id = 'readAloudBtn';
        readAloudButton.className = 'tool-btn';
        readAloudButton.textContent = 'Read Aloud';
        readAloudButton.addEventListener('click', () => readAloudTool.activate());

        // Add to panel
        accessibilityPanel.appendChild(readAloudButton);
    }

    // Return the tool for reference
    return readAloudTool;
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Wait a short delay to ensure accessibility menu is loaded
    setTimeout(addReadAloudToAccessibilityMenu, 500);
});