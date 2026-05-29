// readAloudTool.js - Simplified Read Aloud Tool for Assessment Portal (Kiosk Mode)

class ReadAloudTool {
    constructor(options = {}) {
        // Configuration options
        this.accessCode = options.accessCode || 'reader123';
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
        color: #0a2b72;
      }
      
      .reader-auth-input {
        width: 100%;
        padding: 8px;
        margin: 10px 0;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        box-sizing: border-box;
      }
      
      .reader-auth-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
        gap: 10px;
      }
      
      .reader-auth-btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        flex: 1;
        font-size: 14px;
      }
      
      .reader-auth-submit {
        background: #0a2b72;
        color: white;
        border: none;
      }
      
      .reader-auth-submit:hover {
        background: #1e40af;
      }
      
      .reader-auth-cancel {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
      }
      
      .reader-auth-cancel:hover {
        background: #e5e7eb;
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
        <h3>Read Aloud Tool Access</h3>
        <p>Enter the access code to use the text-to-speech tool</p>
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
            this.openReadAloudTool();
        } else {
            alert('Invalid access code. Please try again.');
            document.getElementById('reader-auth-input').value = '';
            document.getElementById('reader-auth-input').focus();
        }
    }

    // Activate the read aloud tool
    activate() {
        if (!this.authenticated) {
            this.showAuthModal();
            return;
        }

        // Open the read aloud tool in a new window
        this.openReadAloudTool();
    }

    // Open Read Aloud tool in a new window
    openReadAloudTool() {
        // Create a new window with text-to-speech interface
        const windowFeatures = 'width=600,height=700,left=150,top=100,resizable=yes,scrollbars=yes';
        const readerWindow = window.open('', 'ReadAloudTool', windowFeatures);

        if (!readerWindow) {
            alert('Please allow popups to use the read aloud tool. Check your browser settings.');
            return;
        }

        // Create HTML content for the reader window
        readerWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Read Aloud Tool</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: #0a2b72;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .content {
            padding: 20px;
        }
        
        .textarea-container {
            margin-bottom: 20px;
        }
        
        .textarea-container label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
        }
        
        textarea {
            width: 100%;
            min-height: 200px;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            resize: vertical;
            transition: border-color 0.2s;
        }
        
        textarea:focus {
            outline: none;
            border-color: #0a2b72;
        }
        
        .controls {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
        }
        
        .control-group label {
            margin-bottom: 5px;
            font-size: 14px;
            color: #4b5563;
            font-weight: 500;
        }
        
        select, input[type="range"] {
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .range-value {
            text-align: center;
            margin-top: 5px;
            font-size: 12px;
            color: #6b7280;
        }
        
        .button-group {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        
        button {
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn-play {
            background: #10b981;
            color: white;
        }
        
        .btn-play:hover {
            background: #059669;
        }
        
        .btn-pause {
            background: #f59e0b;
            color: white;
        }
        
        .btn-pause:hover {
            background: #d97706;
        }
        
        .btn-stop {
            background: #ef4444;
            color: white;
        }
        
        .btn-stop:hover {
            background: #dc2626;
        }
        
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .status {
            margin-top: 20px;
            padding: 12px;
            background: #f3f4f6;
            border-radius: 8px;
            text-align: center;
            font-size: 14px;
            color: #4b5563;
        }
        
        .info {
            margin-top: 20px;
            padding: 15px;
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
            font-size: 13px;
            color: #1e40af;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔊 Read Aloud Tool</h1>
            <p>Text-to-Speech Assistant</p>
        </div>
        
        <div class="content">
            <div class="textarea-container">
                <label for="textInput">Enter or paste text to be read aloud:</label>
                <textarea id="textInput" placeholder="Type or paste your text here..."></textarea>
            </div>
            
            <div class="controls">
                <div class="control-group">
                    <label for="voiceSelect">Voice:</label>
                    <select id="voiceSelect"></select>
                </div>
                
                <div class="control-group">
                    <label for="rateControl">Speed: <span id="rateValue">1.0x</span></label>
                    <input type="range" id="rateControl" min="0.5" max="2" step="0.1" value="1">
                </div>
                
                <div class="control-group">
                    <label for="pitchControl">Pitch: <span id="pitchValue">1.0</span></label>
                    <input type="range" id="pitchControl" min="0.5" max="2" step="0.1" value="1">
                </div>
                
                <div class="control-group">
                    <label for="volumeControl">Volume: <span id="volumeValue">100%</span></label>
                    <input type="range" id="volumeControl" min="0" max="1" step="0.1" value="1">
                </div>
            </div>
            
            <div class="button-group">
                <button id="playBtn" class="btn-play">
                    ▶ Play
                </button>
                <button id="pauseBtn" class="btn-pause" disabled>
                    ⏸ Pause
                </button>
                <button id="stopBtn" class="btn-stop" disabled>
                    ⏹ Stop
                </button>
            </div>
            
            <div class="status" id="status">Ready to read</div>
            
            <div class="info">
                💡 <strong>Tip:</strong> You can copy text from your assessment and paste it here to have it read aloud.
            </div>
        </div>
    </div>
    
    <script>
        // Speech Synthesis Setup
        const synth = window.speechSynthesis;
        let currentUtterance = null;
        let isPaused = false;
        
        // Elements
        const textInput = document.getElementById('textInput');
        const voiceSelect = document.getElementById('voiceSelect');
        const rateControl = document.getElementById('rateControl');
        const pitchControl = document.getElementById('pitchControl');
        const volumeControl = document.getElementById('volumeControl');
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const status = document.getElementById('status');
        
        // Load voices
        function loadVoices() {
            const voices = synth.getVoices();
            voiceSelect.innerHTML = '';
            
            // Prioritize English voices
            const englishVoices = voices.filter(voice => voice.lang.includes('en'));
            const otherVoices = voices.filter(voice => !voice.lang.includes('en'));
            
            [...englishVoices, ...otherVoices].forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = \`\${voice.name} (\${voice.lang})\`;
                if (voice.default) {
                    option.selected = true;
                }
                voiceSelect.appendChild(option);
            });
        }
        
        // Load voices on page load and when they change
        loadVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
        
        // Update slider values
        rateControl.addEventListener('input', (e) => {
            document.getElementById('rateValue').textContent = e.target.value + 'x';
        });
        
        pitchControl.addEventListener('input', (e) => {
            document.getElementById('pitchValue').textContent = e.target.value;
        });
        
        volumeControl.addEventListener('input', (e) => {
            document.getElementById('volumeValue').textContent = Math.round(e.target.value * 100) + '%';
        });
        
        // Play button
        playBtn.addEventListener('click', () => {
            const text = textInput.value.trim();
            if (!text) {
                status.textContent = '⚠️ Please enter some text first';
                return;
            }
            
            if (isPaused) {
                synth.resume();
                isPaused = false;
                pauseBtn.textContent = '⏸ Pause';
                status.textContent = '🔊 Speaking...';
            } else {
                speak(text);
            }
        });
        
        // Pause button
        pauseBtn.addEventListener('click', () => {
            if (synth.speaking && !isPaused) {
                synth.pause();
                isPaused = true;
                pauseBtn.textContent = '▶ Resume';
                status.textContent = '⏸ Paused';
            } else if (isPaused) {
                synth.resume();
                isPaused = false;
                pauseBtn.textContent = '⏸ Pause';
                status.textContent = '🔊 Speaking...';
            }
        });
        
        // Stop button
        stopBtn.addEventListener('click', () => {
            synth.cancel();
            isPaused = false;
            updateButtons(false);
            status.textContent = '⏹ Stopped';
            setTimeout(() => {
                status.textContent = 'Ready to read';
            }, 2000);
        });
        
        // Speak function
        function speak(text) {
            synth.cancel();
            
            currentUtterance = new SpeechSynthesisUtterance(text);
            
            // Get selected voice
            const voices = synth.getVoices();
            const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
            if (selectedVoice) {
                currentUtterance.voice = selectedVoice;
            }
            
            // Set parameters
            currentUtterance.rate = parseFloat(rateControl.value);
            currentUtterance.pitch = parseFloat(pitchControl.value);
            currentUtterance.volume = parseFloat(volumeControl.value);
            
            // Event handlers
            currentUtterance.onstart = () => {
                updateButtons(true);
                status.textContent = '🔊 Speaking...';
            };
            
            currentUtterance.onend = () => {
                updateButtons(false);
                isPaused = false;
                status.textContent = '✅ Finished reading';
                setTimeout(() => {
                    status.textContent = 'Ready to read';
                }, 2000);
            };
            
            currentUtterance.onerror = (event) => {
                console.error('Speech error:', event);
                updateButtons(false);
                status.textContent = '❌ Error: ' + event.error;
            };
            
            synth.speak(currentUtterance);
        }
        
        // Update button states
        function updateButtons(isSpeaking) {
            playBtn.disabled = isSpeaking;
            pauseBtn.disabled = !isSpeaking;
            stopBtn.disabled = !isSpeaking;
        }
    </script>
</body>
</html>
        `);

        readerWindow.document.close();
        console.log('Read Aloud tool opened successfully');
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