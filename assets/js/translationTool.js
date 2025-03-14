// translationTool.js - Mandarin Translation Tool for Assessment Portal

class TranslationTool {
    constructor(options = {}) {
        // Configuration options
        this.apiKey = options.apiKey || '';
        this.accessCode = options.accessCode || 'translate123';
        this.sourceLanguage = 'en';
        this.targetLanguage = 'zh'; // Mandarin
        this.isActive = false;
        this.authenticated = false;

        // Cache for storing recent translations
        this.translationCache = new Map();

        // Initialize components
        this.init();
    }

    init() {
        this.createStyles();
    }

    // Add required CSS styles
    createStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
      .translation-panel {
        position: fixed;
        right: 20px;
        top: 100px;
        width: 320px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9995;
        overflow: hidden;
        display: none;
        resize: both;
        min-width: 280px;
        min-height: 200px;
        max-width: 600px;
        max-height: 80vh;
      }
      
      .translation-panel.active {
        display: block;
      }
      
      .translation-header {
        padding: 12px 15px;
        background: #0a2b72;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }
      
      .translation-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .translation-controls {
        display: flex;
        gap: 8px;
      }
      
      .translation-btn {
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
      
      .translation-tabs {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
      }
      .translation-language-selectors {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 5px;
}

.translation-language-from,
.translation-language-to {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.translation-language-from label,
.translation-language-to label {
  font-size: 12px;
  margin-bottom: 4px;
  color: #4b5563;
}

.translation-language-from select,
.translation-language-to select {
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
}

.translation-swap-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  padding: 6px 10px;
  margin-top: 22px; /* Align with dropdowns */
  transition: background 0.2s;
}

.translation-swap-btn:hover {
  background: #e5e7eb;
}
      .translation-tab {
        padding: 8px 15px;
        background: #f9fafb;
        border: none;
        cursor: pointer;
        flex: 1;
      }
      
      .translation-tab.active {
        background: white;
        font-weight: 500;
        box-shadow: inset 0 -2px 0 #0a2b72;
      }
      
      .translation-content {
        display: flex;
        flex-direction: column;
        height: calc(100% - 92px);
        padding: 10px;
      }
      
      .translation-section {
        display: none;
        flex-direction: column;
        height: 100%;
      }
      
      .translation-section.active {
        display: flex;
      }
      
      .translation-input-container, .translation-output-container {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      
      .translation-input-container h4, .translation-output-container h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        color: #4b5563;
      }
      
      .translation-textarea {
        flex: 1;
        min-height: 60px;
        padding: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        resize: none;
        font-size: 14px;
        margin-bottom: 10px;
      }
      
      .translation-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px 0;
      }
      
      .translation-divider button {
        padding: 4px 8px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .translation-footer {
        display: flex;
        justify-content: space-between;
        padding: 5px 10px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #6b7280;
      }
      
      .translation-popup {
        position: absolute;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        border-radius: 4px;
        padding: 10px;
        max-width: 300px;
        z-index: 9998;
        font-size: 14px;
      }
      
      .translation-popup-content {
        margin-bottom: 8px;
      }
      
      .translation-popup-actions {
        display: flex;
        justify-content: space-between;
      }
      
      .translation-popup-btn {
        padding: 4px 8px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .translation-auth-modal {
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
      
      .translation-auth-content {
        background: white;
        border-radius: 8px;
        padding: 20px;
        width: 90%;
        max-width: 350px;
      }
      
      .translation-auth-content h3 {
        margin-top: 0;
      }
      
      .translation-auth-input {
        width: 100%;
        padding: 8px;
        margin: 10px 0;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
      }
      
      .translation-auth-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
      }
      
      .translation-auth-btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .translation-auth-submit {
        background: #0a2b72;
        color: white;
        border: none;
      }
      
      .translation-auth-cancel {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
      }
    `;

        document.head.appendChild(styleEl);
    }

    // Show authentication modal
    showAuthModal() {
        const modal = document.createElement('div');
        modal.className = 'translation-auth-modal';
        modal.innerHTML = `
      <div class="translation-auth-content">
        <h3>Enter Translation Tool Access Code</h3>
        <input type="password" class="translation-auth-input" id="translation-auth-input" placeholder="Enter access code">
        <div class="translation-auth-buttons">
          <button class="translation-auth-btn translation-auth-submit" id="translation-auth-submit">Submit</button>
          <button class="translation-auth-btn translation-auth-cancel" id="translation-auth-cancel">Cancel</button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        // Focus on input
        setTimeout(() => {
            document.getElementById('translation-auth-input').focus();
        }, 100);

        // Add event listeners
        document.getElementById('translation-auth-submit').addEventListener('click', () => {
            const code = document.getElementById('translation-auth-input').value;
            this.verifyAccessCode(code, modal);
        });

        document.getElementById('translation-auth-cancel').addEventListener('click', () => {
            modal.remove();
        });

        // Allow Enter key
        document.getElementById('translation-auth-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const code = document.getElementById('translation-auth-input').value;
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

    // Activate the translation tool
    activate() {
        if (!this.authenticated) {
            this.showAuthModal();
            return;
        }

        if (this.isActive) {
            return; // Already active
        }

        this.isActive = true;
        this.createTranslationPanel();
        this.setupSelectionListener();
    }

    // Deactivate the translation tool
    deactivate() {
        this.isActive = false;

        // Remove panel if it exists
        const panel = document.querySelector('.translation-panel');
        if (panel) {
            panel.remove();
        }

        // Remove any popup
        const popup = document.querySelector('.translation-popup');
        if (popup) {
            popup.remove();
        }

        // Remove selection listener
        document.removeEventListener('mouseup', this.handleSelection);
    }

    // Create the main translation panel
    createTranslationPanel() {
        const panel = document.createElement('div');
        const languages = [
            { code: 'zh', name: 'Chinese (Mandarin)' },
            { code: 'en', name: 'English' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'it', name: 'Italian' }
        ];
        let languageOptions = '';
        languages.forEach(lang => {
            languageOptions += `<option value="${lang.code}">${lang.name}</option>`;
        });
        panel.innerHTML = `
    <div class="translation-header">
      <h3>Translation Tool</h3>
      <div class="translation-controls">
        <button class="translation-btn translation-minimize" title="Minimize">_</button>
        <button class="translation-btn translation-close" title="Close">×</button>
      </div>
    </div>
    <div class="translation-tabs">
      <button class="translation-tab active" data-tab="translate-text">Translate My Text</button>
      <button class="translation-tab" data-tab="highlight-translate">Translate Selection</button>
    </div>
    <div class="translation-content">
      <div class="translation-section active" id="translate-text">
        <div class="translation-language-selectors">
          <div class="translation-language-from">
            <label for="source-language">From:</label>
            <select id="source-language">${languageOptions}</select>
          </div>
          <button class="translation-swap-btn" id="swap-languages">⇄</button>
          <div class="translation-language-to">
            <label for="target-language">To:</label>
            <select id="target-language">${languageOptions}</select>
          </div>
        </div>
        <div class="translation-input-container">
          <h4>Input Text:</h4>
          <textarea class="translation-textarea" id="input-text" placeholder="Type text to translate..."></textarea>
        </div>
        <div class="translation-divider">
          <button id="translate-text-btn">Translate ↓</button>
        </div>
        <div class="translation-output-container">
          <h4>Translation:</h4>
          <textarea class="translation-textarea" id="output-text" placeholder="Translation will appear here..." readonly></textarea>
          <button id="copy-translation" class="translation-popup-btn">Copy to Clipboard</button>
        </div>
      </div>
      
      <div class="translation-section" id="highlight-translate">
        <div class="translation-language-selectors">
          <div class="translation-language-to">
            <label for="selection-target-language">Translate selection to:</label>
            <select id="selection-target-language">${languageOptions}</select>
          </div>
        </div>
        <p>Highlight any text in the assessment to see it translated.</p>
        <div class="translation-input-container">
          <h4>Selected Text:</h4>
          <textarea class="translation-textarea" id="selected-text" placeholder="Highlight text in the assessment..." readonly></textarea>
        </div>
        <div class="translation-divider">
          <button id="translate-selection">Translate ↓</button>
        </div>
        <div class="translation-output-container">
          <h4>Translation:</h4>
          <textarea class="translation-textarea" id="selection-output" placeholder="Translation will appear here..." readonly></textarea>
          <button id="copy-selection" class="translation-popup-btn">Copy to Clipboard</button>
        </div>
      </div>
    </div>
    <div class="translation-footer">
      <span>Translation Tool</span>
      <span id="translation-status">Ready</span>
    </div>
  `;

        document.body.appendChild(panel);
        document.getElementById('source-language').value = 'en';
        document.getElementById('target-language').value = 'zh';
        document.getElementById('selection-target-language').value = 'zh';
        // Make panel draggable
        this.makeDraggable(panel);

        // Setup event listeners
        this.setupPanelListeners(panel);
    }

    // Setup event listeners for the panel
    setupPanelListeners(panel) {
        // Tab switching
        const tabs = panel.querySelectorAll('.translation-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show active section
                const sections = panel.querySelectorAll('.translation-section');
                sections.forEach(section => section.classList.remove('active'));
                panel.querySelector(`#${tab.dataset.tab}`).classList.add('active');
            });
        });
        // Swap languages button
        panel.querySelector('#swap-languages').addEventListener('click', () => {
            const sourceSelect = panel.querySelector('#source-language');
            const targetSelect = panel.querySelector('#target-language');
            const tempValue = sourceSelect.value;
            sourceSelect.value = targetSelect.value;
            targetSelect.value = tempValue;

            // If there's text, swap that too
            const inputText = panel.querySelector('#input-text');
            const outputText = panel.querySelector('#output-text');
            if (inputText.value && outputText.value) {
                inputText.value = outputText.value;
                outputText.value = '';
                panel.querySelector('#translation-status').textContent = 'Languages swapped';
                setTimeout(() => {
                    panel.querySelector('#translation-status').textContent = 'Ready';
                }, 2000);
            }
        });

        // Translate button for manual input
        panel.querySelector('#translate-text-btn').addEventListener('click', () => {
            const text = panel.querySelector('#input-text').value.trim();
            if (text) {
                const sourceLanguage = panel.querySelector('#source-language').value;
                const targetLanguage = panel.querySelector('#target-language').value;

                panel.querySelector('#translation-status').textContent = 'Translating...';
                this.translateText(text, sourceLanguage, targetLanguage, result => {
                    panel.querySelector('#output-text').value = result;
                    panel.querySelector('#translation-status').textContent = 'Translation complete';
                    setTimeout(() => {
                        panel.querySelector('#translation-status').textContent = 'Ready';
                    }, 2000);
                });
            }
        });

        panel.querySelector('#translate-selection').addEventListener('click', () => {
            const text = panel.querySelector('#selected-text').value.trim();
            if (text) {
                // For selection, we always translate from document language (assume English)
                // to the selected target language
                const targetLanguage = panel.querySelector('#selection-target-language').value;

                panel.querySelector('#translation-status').textContent = 'Translating...';
                this.translateText(text, 'en', targetLanguage, result => {
                    panel.querySelector('#selection-output').value = result;
                    panel.querySelector('#translation-status').textContent = 'Translation complete';
                    setTimeout(() => {
                        panel.querySelector('#translation-status').textContent = 'Ready';
                    }, 2000);
                });
            }
        });

        // Close button
        panel.querySelector('.translation-close').addEventListener('click', () => {
            this.deactivate();
        });

        // Minimize button
        panel.querySelector('.translation-minimize').addEventListener('click', () => {
            panel.classList.toggle('active');

            // Change button text based on state
            const btn = panel.querySelector('.translation-minimize');
            btn.textContent = panel.classList.contains('active') ? '_' : '□';
            btn.title = panel.classList.contains('active') ? 'Minimize' : 'Maximize';
        });

        // Translation buttons
        panel.querySelector('#translate-to-english').addEventListener('click', () => {
            const text = panel.querySelector('#mandarin-input').value.trim();
            if (text) {
                this.translateText(text, 'zh', 'en', result => {
                    panel.querySelector('#english-output').value = result;
                });
            }
        });

        panel.querySelector('#translate-selection').addEventListener('click', () => {
            const text = panel.querySelector('#selected-text').value.trim();
            if (text) {
                this.translateText(text, 'en', 'zh', result => {
                    panel.querySelector('#mandarin-output').value = result;
                });
            }
        });

        // Copy buttons
        panel.querySelector('#copy-translation').addEventListener('click', () => {
            const text = panel.querySelector('#output-text').value;
            this.copyToClipboard(text);
        });

        panel.querySelector('#copy-selection').addEventListener('click', () => {
            const text = panel.querySelector('#selection-output').value;
            this.copyToClipboard(text);
        });

        let typingTimer;
        panel.querySelector('#input-text').addEventListener('input', () => {
            clearTimeout(typingTimer);
            panel.querySelector('#translation-status').textContent = 'Typing...';

            typingTimer = setTimeout(() => {
                const text = panel.querySelector('#input-text').value.trim();
                if (text) {
                    const sourceLanguage = panel.querySelector('#source-language').value;
                    const targetLanguage = panel.querySelector('#target-language').value;

                    panel.querySelector('#translation-status').textContent = 'Translating...';
                    this.translateText(text, sourceLanguage, targetLanguage, result => {
                        panel.querySelector('#output-text').value = result;
                        panel.querySelector('#translation-status').textContent = 'Ready';
                    });
                } else {
                    panel.querySelector('#output-text').value = '';
                    panel.querySelector('#translation-status').textContent = 'Ready';
                }
            }, 1000); // 1 second delay
        });
    }

    // Make an element draggable
    makeDraggable(element) {
        const header = element.querySelector('.translation-header');
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

                // Update selection in panel
                const panel = document.querySelector('.translation-panel');
                if (panel) {
                    panel.querySelector('#selected-text').value = text;
                }

                // Show popup with quick translation
                this.showTranslationPopup(text, rect);
            } catch (e) {
                console.error('Error handling selection', e);
            }
        };

        document.addEventListener('mouseup', this.handleSelection);
    }

    // Show popup with quick translation
    showTranslationPopup(text, rect) {
        // Remove existing popup
        const existingPopup = document.querySelector('.translation-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create new popup
        const popup = document.createElement('div');
        popup.className = 'translation-popup';
        popup.innerHTML = `
      <div class="translation-popup-content">
        <p>Translating...</p>
      </div>
      <div class="translation-popup-actions">
        <button class="translation-popup-btn" id="popup-copy">Copy</button>
        <button class="translation-popup-btn" id="popup-speak">Speak</button>
        <button class="translation-popup-btn" id="popup-close">Close</button>
      </div>
    `;

        // Position the popup near the selection
        popup.style.left = `${rect.left + window.scrollX}px`;
        popup.style.top = `${rect.bottom + window.scrollY + 10}px`;

        document.body.appendChild(popup);

        // Ensure popup stays in viewport
        const popupRect = popup.getBoundingClientRect();
        if (popupRect.right > window.innerWidth) {
            popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
        }
        if (popupRect.bottom > window.innerHeight) {
            popup.style.top = `${rect.top + window.scrollY - popupRect.height - 10}px`;
        }

        // Add event listeners
        document.getElementById('popup-close').addEventListener('click', () => {
            popup.remove();
        });

        // Add copy functionality
        document.getElementById('popup-copy').addEventListener('click', () => {
            const content = popup.querySelector('.translation-popup-content').textContent;
            this.copyToClipboard(content);
            popup.remove();
        });

        // Add speech functionality
        document.getElementById('popup-speak').addEventListener('click', () => {
            const content = popup.querySelector('.translation-popup-content').textContent;
            this.speakText(content, 'zh-CN');
        });

        // Translate the text
        this.translateText(text, 'en', 'zh', result => {
            popup.querySelector('.translation-popup-content').textContent = result;
        });
    }

    // Translate text using API or service
    translateText(text, sourceLang, targetLang, callback) {
        // Check cache first
        const cacheKey = `${sourceLang}-${targetLang}-${text}`;
        if (this.translationCache.has(cacheKey)) {
            callback(this.translationCache.get(cacheKey));
            return;
        }

        // For a production implementation, you would use a proper translation API
        // This is a simplified example that uses Google Translate's webpage as a fallback
        if (!this.apiKey) {
            // Open Google Translate in a new window/tab with the text pre-filled
            const url = `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(text)}`;

            // Inform the user how to proceed
            alert(`Since no translation API key is available, we'll open Google Translate in a new tab. Please copy the translation from there.`);
            window.open(url, '_blank');

            // Return a placeholder message
            const placeholder = `[Translation requested: ${text}]\n\nPlease check the opened Google Translate tab for the translation.`;
            callback(placeholder);
            return;
        }

        // If you have an API key, implement the actual API call here
        // For now, we'll use a mock implementation
        this.mockTranslate(text, sourceLang, targetLang, result => {
            // Cache the result
            this.translationCache.set(cacheKey, result);
            callback(result);
        });
    }

    // Mock translation function for development
    mockTranslate(text, sourceLang, targetLang, callback) {
        // Simulate API delay
        setTimeout(() => {
            let result;

            // Very basic mock translation for testing
            if (sourceLang === 'en' && targetLang === 'zh') {
                // English to Mandarin mock
                result = `[中文翻译: ${text}]`;
            } else {
                // Mandarin to English mock
                result = `[English translation of: ${text}]`;
            }

            callback(result);
        }, 500);
    }

    // Copy text to clipboard
    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Show feedback
                const status = document.querySelector('#translation-status');
                if (status) {
                    status.textContent = 'Copied to clipboard!';
                    setTimeout(() => {
                        status.textContent = 'Ready';
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('Error copying text: ', err);
                alert('Could not copy text: ' + err.message);
            });
    }

    // Text-to-speech function
    speakText(text, lang) {
        if (!window.speechSynthesis) {
            alert('Your browser does not support text-to-speech functionality');
            return;
        }

        // Create utterance with specified language
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        // Find a voice that matches the language
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (voice) {
            utterance.voice = voice;
        }

        window.speechSynthesis.speak(utterance);
    }
}

// Function to add translation tool to existing accessibility menu
function addTranslationToAccessibilityMenu() {
    // Create the translation tool instance
    const translationTool = new TranslationTool({
        accessCode: 'translate123',
        // apiKey: 'YOUR_GOOGLE_TRANSLATE_API_KEY' // Uncomment and add your API key for production
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

    // Check if translation button already exists
    const existingButton = accessibilityPanel.querySelector('#translateBtn');
    if (existingButton) {
        // Update existing button
        existingButton.onclick = () => translationTool.activate();
    } else {
        // Create new button
        const translateButton = document.createElement('button');
        translateButton.id = 'translateBtn';
        translateButton.className = 'tool-btn';
        translateButton.textContent = 'Translator';
        translateButton.addEventListener('click', () => translationTool.activate());

        // Add to panel
        accessibilityPanel.appendChild(translateButton);
    }

    // Return the tool for reference
    return translationTool;
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Wait a short delay to ensure accessibility menu is loaded
    setTimeout(addTranslationToAccessibilityMenu, 500);
});