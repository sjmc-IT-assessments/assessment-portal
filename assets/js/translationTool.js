// translationTool.js - Simplified Translation Tool for Assessment Portal (Kiosk Mode)

class TranslationTool {
  constructor(options = {}) {
    // Configuration options
    this.accessCode = options.accessCode || 'translate123';
    this.targetLanguage = options.targetLanguage || 'zh'; // Default to Mandarin
    this.authenticated = false;

    // Initialize components
    this.init();
  }

  init() {
    this.createStyles();
  }

  // Add required CSS styles for authentication modal
  createStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
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
        color: #0a2b72;
      }
      
      .translation-auth-input {
        width: 100%;
        padding: 8px;
        margin: 10px 0;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        box-sizing: border-box;
      }
      
      .translation-auth-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
        gap: 10px;
      }
      
      .translation-auth-btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        flex: 1;
        font-size: 14px;
      }
      
      .translation-auth-submit {
        background: #0a2b72;
        color: white;
        border: none;
      }
      
      .translation-auth-submit:hover {
        background: #1e40af;
      }
      
      .translation-auth-cancel {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
      }
      
      .translation-auth-cancel:hover {
        background: #e5e7eb;
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
        <h3>Translation Tool Access</h3>
        <p>Enter the access code to open Google Translate</p>
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
      this.openGoogleTranslate();
    } else {
      alert('Invalid access code. Please try again.');
      document.getElementById('translation-auth-input').value = '';
      document.getElementById('translation-auth-input').focus();
    }
  }

  // Activate the translation tool
  activate() {
    if (!this.authenticated) {
      this.showAuthModal();
      return;
    }

    // Open Google Translate in a new window
    this.openGoogleTranslate();
  }

  // Open Google Translate in a new window
  openGoogleTranslate() {
    // Configure Google Translate URL
    // You can customize the source and target languages here
    const sourceLanguage = 'en'; // English
    const targetLanguage = this.targetLanguage; // Default to Mandarin (zh)

    // Open Google Translate with specific language pair
    const translateUrl = `https://translate.google.com/?sl=${sourceLanguage}&tl=${targetLanguage}&op=translate`;

    // Open in a new window with specific dimensions
    const windowFeatures = 'width=800,height=600,left=100,top=100,resizable=yes,scrollbars=yes';
    const translateWindow = window.open(translateUrl, 'GoogleTranslate', windowFeatures);

    if (!translateWindow) {
      alert('Please allow popups to use the translation tool. Check your browser settings.');
    } else {
      console.log('Google Translate opened successfully');
    }
  }
}

// Function to add translation tool to existing accessibility menu
function addTranslationToAccessibilityMenu() {
  // Create the translation tool instance
  const translationTool = new TranslationTool({
    accessCode: 'translate123',
    targetLanguage: 'zh' // Mandarin Chinese
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