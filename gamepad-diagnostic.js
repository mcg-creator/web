// ASUS ROG Ally Gamepad Diagnostic Tool
// This script will help identify gamepad connection and input issues

class GamepadDiagnostic {
    constructor() {
        this.diagnosticInterval = null;
        this.isRunning = false;
        this.gamepadHistory = [];
        
        // Create diagnostic UI
        this.createDiagnosticUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('🔍 ASUS ROG Ally Diagnostic Tool Initialized');
        console.log('📋 Use startDiagnostic() to begin testing');
    }
    
    createDiagnosticUI() {
        // Create diagnostic overlay
        const overlay = document.createElement('div');
        overlay.id = 'gamepad-diagnostic';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        overlay.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #00ff00;">🎮 ASUS ROG Ally Diagnostic</h3>
            <div id="diagnostic-status">Initializing...</div>
            <div id="diagnostic-data"></div>
            <button id="start-diagnostic" style="margin: 10px 5px 0 0; padding: 5px 10px;">Start Test</button>
            <button id="stop-diagnostic" style="margin: 10px 5px 0 0; padding: 5px 10px;">Stop Test</button>
            <button id="close-diagnostic" style="margin: 10px 5px 0 0; padding: 5px 10px;">Close</button>
        `;
        
        document.body.appendChild(overlay);
        
        // Setup button events
        document.getElementById('start-diagnostic').onclick = () => this.startDiagnostic();
        document.getElementById('stop-diagnostic').onclick = () => this.stopDiagnostic();
        document.getElementById('close-diagnostic').onclick = () => this.closeDiagnostic();
    }
    
    setupEventListeners() {
        // Listen for gamepad events
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 Gamepad Connected Event:', e.gamepad);
            this.logGamepadInfo(e.gamepad);
            this.updateStatus(`✅ Gamepad Connected: ${e.gamepad.id}`);
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('🎮 Gamepad Disconnected Event:', e.gamepad);
            this.updateStatus(`❌ Gamepad Disconnected: ${e.gamepad.id}`);
        });
        
        // Add keyboard shortcut to show/hide diagnostic
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleDiagnostic();
            }
        });
    }
    
    logGamepadInfo(gamepad) {
        const info = {
            id: gamepad.id,
            index: gamepad.index,
            connected: gamepad.connected,
            mapping: gamepad.mapping,
            buttons: gamepad.buttons.length,
            axes: gamepad.axes.length,
            timestamp: gamepad.timestamp
        };
        
        console.log('🎮 Gamepad Details:', info);
        this.gamepadHistory.push({
            timestamp: Date.now(),
            event: 'connected',
            gamepad: info
        });
    }
    
    startDiagnostic() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateStatus('🔍 Running diagnostic... Press any button or move sticks');
        
        this.diagnosticInterval = setInterval(() => {
            this.runDiagnosticCheck();
        }, 100); // Check every 100ms
        
        console.log('🔍 Starting ASUS ROG Ally diagnostic...');
    }
    
    stopDiagnostic() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.diagnosticInterval) {
            clearInterval(this.diagnosticInterval);
            this.diagnosticInterval = null;
        }
        
        this.updateStatus('⏹️ Diagnostic stopped');
        console.log('⏹️ Diagnostic stopped');
    }
    
    runDiagnosticCheck() {
        const gamepads = navigator.getGamepads();
        let diagnosticData = '<h4>🎮 Gamepad Status:</h4>';
        
        // Check if any gamepads are available
        if (!gamepads || gamepads.length === 0) {
            diagnosticData += '<div style="color: #ff4444;">❌ No gamepads detected by browser</div>';
        } else {
            diagnosticData += `<div>📊 Browser reports ${gamepads.length} gamepad slots</div>`;
            
            let connectedCount = 0;
            for (let i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];
                if (gamepad) {
                    connectedCount++;
                    diagnosticData += this.formatGamepadData(gamepad, i);
                } else {
                    diagnosticData += `<div style="color: #888;">Slot ${i}: Empty</div>`;
                }
            }
            
            if (connectedCount === 0) {
                diagnosticData += '<div style="color: #ff4444;">❌ No active gamepads found</div>';
                diagnosticData += '<div style="color: #ffaa00;">💡 Try:</div>';
                diagnosticData += '<div style="margin-left: 15px;">1. Press any button on your ROG Ally</div>';
                diagnosticData += '<div style="margin-left: 15px;">2. Check Windows Game Controller settings</div>';
                diagnosticData += '<div style="margin-left: 15px;">3. Restart browser after connecting</div>';
            }
        }
        
        // Add general troubleshooting info
        diagnosticData += '<h4>🔧 Troubleshooting:</h4>';
        diagnosticData += '<div style="font-size: 11px; color: #aaa;">';
        diagnosticData += '• ASUS ROG Ally should appear as "Xbox Controller"<br>';
        diagnosticData += '• Try pressing any button to wake up controller<br>';
        diagnosticData += '• Check Windows > Settings > Gaming > Xbox Game Bar<br>';
        diagnosticData += '• Use Ctrl+D to toggle this diagnostic panel<br>';
        diagnosticData += '</div>';
        
        this.updateData(diagnosticData);
    }
    
    formatGamepadData(gamepad, index) {
        let data = `<div style="border: 1px solid #555; margin: 5px 0; padding: 8px; border-radius: 5px;">`;
        data += `<div style="color: #00ff00;"><strong>Gamepad ${index}: ${gamepad.id}</strong></div>`;
        data += `<div>Mapping: ${gamepad.mapping}</div>`;
        data += `<div>Connected: ${gamepad.connected}</div>`;
        data += `<div>Timestamp: ${gamepad.timestamp}</div>`;
        
        // Check for button presses
        const pressedButtons = [];
        gamepad.buttons.forEach((button, i) => {
            if (button.pressed) {
                pressedButtons.push(`${i}(${button.value.toFixed(2)})`);
            }
        });
        
        if (pressedButtons.length > 0) {
            data += `<div style="color: #00ff00;">🟢 Pressed Buttons: ${pressedButtons.join(', ')}</div>`;
        } else {
            data += `<div style="color: #888;">⚪ No buttons pressed</div>`;
        }
        
        // Check axes (sticks)
        const activeAxes = [];
        gamepad.axes.forEach((value, i) => {
            if (Math.abs(value) > 0.1) {
                activeAxes.push(`${i}: ${value.toFixed(2)}`);
            }
        });
        
        if (activeAxes.length > 0) {
            data += `<div style="color: #00ff00;">🟢 Active Axes: ${activeAxes.join(', ')}</div>`;
        } else {
            data += `<div style="color: #888;">⚪ No stick movement</div>`;
        }
        
        data += '</div>';
        return data;
    }
    
    updateStatus(message) {
        const statusEl = document.getElementById('diagnostic-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }
    
    updateData(data) {
        const dataEl = document.getElementById('diagnostic-data');
        if (dataEl) {
            dataEl.innerHTML = data;
        }
    }
    
    toggleDiagnostic() {
        const overlay = document.getElementById('gamepad-diagnostic');
        if (overlay) {
            overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    showDiagnostic() {
        const overlay = document.getElementById('gamepad-diagnostic');
        if (overlay) {
            overlay.style.display = 'block';
        }
    }
    
    closeDiagnostic() {
        this.stopDiagnostic();
        const overlay = document.getElementById('gamepad-diagnostic');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// Auto-initialize when script loads
let gamepadDiagnostic;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gamepadDiagnostic = new GamepadDiagnostic();
    });
} else {
    gamepadDiagnostic = new GamepadDiagnostic();
}

// Global functions for easy console access
window.startGamepadDiagnostic = () => {
    if (gamepadDiagnostic) {
        gamepadDiagnostic.showDiagnostic();
        gamepadDiagnostic.startDiagnostic();
    }
};

window.stopGamepadDiagnostic = () => {
    if (gamepadDiagnostic) {
        gamepadDiagnostic.stopDiagnostic();
    }
};

console.log('🔍 ASUS ROG Ally Diagnostic Tool Loaded');
console.log('📋 Available commands:');
console.log('  • startGamepadDiagnostic() - Show diagnostic panel');
console.log('  • stopGamepadDiagnostic() - Stop diagnostic');
console.log('  • Press Ctrl+D to toggle diagnostic panel');