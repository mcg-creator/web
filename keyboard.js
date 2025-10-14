// KeyboardManager - Maps keyboard inputs to gamepad-style buttons
// Provides keyboard alternative for all controller inputs

class KeyboardManager {
    constructor() {
        // Keyboard to button mapping
        this.keyMap = {
            // WASD for ABXY (custom layout)
            'w': 'Y',           // W = Y button
            'W': 'Y',
            'a': 'A',           // A = A button (mapped to A for ROG Ally)
            'A': 'A',
            's': 'A',           // S = A button
            'S': 'A',
            'd': 'B',           // D = B button
            'D': 'B',
            
            // Direct ABXY key mapping - additional option
            'x': 'X',           // X key = X button
            'X': 'X',
            'y': 'Y',           // Y key = Y button
            'Y': 'Y',
            'b': 'B',           // B key = B button
            'B': 'B',
            // Note: A key already mapped to X button via WASD
            
            // Arrow keys for D-pad
            'ArrowUp': 'UP',
            'ArrowDown': 'DOWN',
            'ArrowLeft': 'LEFT',
            'ArrowRight': 'RIGHT',
            
            // Q/E for shoulder buttons
            'q': 'LB',
            'Q': 'LB',
            'e': 'RB',
            'E': 'RB',
            
            // Z/C for triggers (or hold Shift with Q/E)
            'z': 'LT',
            'Z': 'LT',
            'c': 'RT',
            'C': 'RT',
            
            // R/F for stick clicks
            'r': 'LS',
            'R': 'LS',
            'f': 'RS',
            'F': 'RS',
            
            // Tab/Enter for menu buttons
            'Tab': 'VIEW',
            'Enter': 'MENU',
            'Escape': 'HOME',
            
            // Spacebar for A button (selection)
            ' ': 'A',
            
            // Number keys for quick testing
            '1': 'LB',
            '2': 'RB',
            '3': 'LT',
            '4': 'RT'
        };

        // Track current and previous key states
        this.keysDown = new Set();
        this.prevKeysDown = new Set();
        
        // Simulated analog stick values
        this.leftStick = { x: 0, y: 0 };
        this.rightStick = { x: 0, y: 0 };
        
        // Simulated trigger values
        this.leftTrigger = 0;
        this.rightTrigger = 0;

        // Special button functions for LB/RB (shoulder buttons) - same as gamepad
        this.shoulderButtonHandlers = {
            'LB': () => this.handlePreviousTab(),
            'RB': () => this.handleNextTab()
        };

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Key down
        window.addEventListener('keydown', (e) => {
            // Prevent default for mapped keys
            if (this.keyMap[e.key]) {
                e.preventDefault();
            }
            
            this.keysDown.add(e.key);
            this.updateSticks();
            this.updateTriggers();
        });

        // Key up
        window.addEventListener('keyup', (e) => {
            this.keysDown.delete(e.key);
            this.updateSticks();
            this.updateTriggers();
        });

        // Prevent context menu on right click if needed
        window.addEventListener('contextmenu', (e) => {
            if (this.keysDown.size > 0) {
                e.preventDefault();
            }
        });
    }

    // Update simulated analog sticks based on keyboard input
    updateSticks() {
        // Left stick: IJKL keys
        let lx = 0, ly = 0;
        if (this.keysDown.has('i') || this.keysDown.has('I')) ly = 1;   // Up
        if (this.keysDown.has('k') || this.keysDown.has('K')) ly = -1;  // Down
        if (this.keysDown.has('j') || this.keysDown.has('J')) lx = -1;  // Left
        if (this.keysDown.has('l') || this.keysDown.has('L')) lx = 1;   // Right

        // Right stick: Numpad 8456 or TFGH
        let rx = 0, ry = 0;
        if (this.keysDown.has('t') || this.keysDown.has('T') || this.keysDown.has('8')) ry = 1;   // Up
        if (this.keysDown.has('g') || this.keysDown.has('G') || this.keysDown.has('5')) ry = -1;  // Down
        if (this.keysDown.has('f') || this.keysDown.has('F') || this.keysDown.has('4')) rx = -1;  // Left  
        if (this.keysDown.has('h') || this.keysDown.has('H') || this.keysDown.has('6')) rx = 1;   // Right

        this.leftStick = { x: lx, y: ly };
        this.rightStick = { x: rx, y: ry };
    }

    // Update simulated trigger values
    updateTriggers() {
        this.leftTrigger = (this.keysDown.has('z') || this.keysDown.has('Z') || this.keysDown.has('3')) ? 1.0 : 0.0;
        this.rightTrigger = (this.keysDown.has('c') || this.keysDown.has('C') || this.keysDown.has('4')) ? 1.0 : 0.0;
    }

    // Update - call this each frame
    update() {
        this.prevKeysDown = new Set(this.keysDown);
        
        // Handle special shoulder button functions (LB/RB for tab switching)
        this.handleShoulderButtons();
    }

    // Check if a button is currently pressed
    isButtonDown(buttonName) {
        // Check all keys mapped to this button
        for (const [key, mappedButton] of Object.entries(this.keyMap)) {
            if (mappedButton === buttonName && this.keysDown.has(key)) {
                return true;
            }
        }
        return false;
    }

    // Check if a button was just pressed this frame
    justPressed(buttonName) {
        const isDownNow = this.isButtonDown(buttonName);
        if (!isDownNow) return false;

        // Check if it wasn't down in previous frame
        for (const [key, mappedButton] of Object.entries(this.keyMap)) {
            if (mappedButton === buttonName && this.prevKeysDown.has(key)) {
                return false; // Was already down
            }
        }
        return true;
    }

    // Check if a button was just released this frame
    justReleased(buttonName) {
        const isDownNow = this.isButtonDown(buttonName);
        if (isDownNow) return false;

        // Check if it was down in previous frame
        for (const [key, mappedButton] of Object.entries(this.keyMap)) {
            if (mappedButton === buttonName && this.prevKeysDown.has(key)) {
                return true; // Was down, now isn't
            }
        }
        return false;
    }

    // Get analog stick value (simulated from keys)
    getStick(stickName) {
        const stick = stickName === 'LEFT' ? this.leftStick : this.rightStick;
        const magnitude = Math.hypot(stick.x, stick.y);
        
        // Normalize diagonal movement
        if (magnitude > 1) {
            return {
                x: stick.x / magnitude,
                y: stick.y / magnitude,
                magnitude: 1
            };
        }
        
        return {
            x: stick.x,
            y: stick.y,
            magnitude: magnitude
        };
    }

    // Get trigger value (simulated from keys)
    getTrigger(triggerName) {
        return triggerName === 'LT' ? this.leftTrigger : this.rightTrigger;
    }

    // Get all currently pressed buttons
    getPressedButtons() {
        const pressed = [];
        const buttonNames = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 
                            'LS', 'RS', 'UP', 'DOWN', 'LEFT', 'RIGHT', 
                            'VIEW', 'MENU', 'HOME'];
        
        for (const button of buttonNames) {
            if (this.isButtonDown(button)) {
                pressed.push(button);
            }
        }
        return pressed;
    }

    // Get keyboard mapping reference
    getKeyboardMap() {
        return {
            'ABXY': 'W/A/S/D (Y/A/A/B)',
            'D-Pad': 'Arrow Keys',
            'Shoulders': 'Q/E (LB/RB)',
            'Triggers': 'Z/C or 3/4 (LT/RT)',
            'Left Stick': 'I/J/K/L',
            'Right Stick': 'T/F/G/H or Numpad 8/4/5/6',
            'Stick Clicks': 'R/F (LS/RS)',
            'Menu': 'Tab/Enter/Esc (VIEW/MENU/HOME)'
        };
    }

    // Get keyboard controls info
    getKeyboardControls() {
        return {
            'Navigation': 'Arrow Keys (↑↓←→)',
            'Selection': 'A key, S key, or Spacebar',
            'Quick Tab Switch': 'Q (Previous Tab), E (Next Tab) - maintains carousel focus',
            'Alternative Navigation': 'WASD or IJKL',
            'Menu': 'Enter (MENU), Tab (VIEW), Esc (HOME)',
            'Shoulders': 'Q (LB), E (RB)',
            'Triggers': 'Z (LT), C (RT)'
        };
    }

    // Handle shoulder buttons for tab switching (LB/RB) - same logic as gamepad
    handleShoulderButtons() {
        // Check each shoulder button
        for (const [buttonName, handler] of Object.entries(this.shoulderButtonHandlers)) {
            const justPressedNow = this.justPressed(buttonName);

            if (justPressedNow) {
                console.log(`⌨️ ${buttonName} key pressed, executing tab switch`);
                handler();
            }
        }
    }

    // Handle previous tab (LB button / Q key)
    handlePreviousTab() {
        // Access the global navigation variables from the HTML
        if (typeof window.selectedIndex !== 'undefined' && typeof window.tabs !== 'undefined') {
            const currentIndex = window.selectedIndex;
            const totalTabs = window.tabs.length;
            const newIndex = (currentIndex - 1 + totalTabs) % totalTabs;
            
            console.log(`⌨️ Q key (LB): Switching from tab ${currentIndex} to ${newIndex} (${window.tabs[newIndex]})`);
            
            // Check if we're in carousel mode and should maintain focus
            if (typeof window.navigationFocus !== 'undefined' && window.navigationFocus === 'carousel') {
                // Switch tab but maintain carousel focus
                this.switchTabMaintainCarouselFocus(newIndex);
            } else {
                // Normal tab switch (will reset to nav focus)
                window.selectTab(newIndex);
            }
        }
    }

    // Handle next tab (RB button / E key)
    handleNextTab() {
        // Access the global navigation variables from the HTML
        if (typeof window.selectedIndex !== 'undefined' && typeof window.tabs !== 'undefined') {
            const currentIndex = window.selectedIndex;
            const totalTabs = window.tabs.length;
            const newIndex = (currentIndex + 1) % totalTabs;
            
            console.log(`⌨️ E key (RB): Switching from tab ${currentIndex} to ${newIndex} (${window.tabs[newIndex]})`);
            
            // Check if we're in carousel mode and should maintain focus
            if (typeof window.navigationFocus !== 'undefined' && window.navigationFocus === 'carousel') {
                // Switch tab but maintain carousel focus
                this.switchTabMaintainCarouselFocus(newIndex);
            } else {
                // Normal tab switch (will reset to nav focus)
                window.selectTab(newIndex);
            }
        }
    }

    // Switch tab while maintaining carousel focus - same logic as gamepad
    switchTabMaintainCarouselFocus(newIndex) {
        if (typeof window.selectTab === 'function') {
            // Store the current focus state
            const wasFocusedOnCarousel = window.navigationFocus === 'carousel';
            
            // Switch to the new tab
            window.selectTab(newIndex);
            
            // If we were focused on carousel, restore that focus
            if (wasFocusedOnCarousel) {
                // Small delay to ensure tab switch is complete
                setTimeout(() => {
                    window.navigationFocus = 'carousel';
                    if (typeof window.updateFocusVisuals === 'function') {
                        window.updateFocusVisuals();
                    }
                    console.log(`⌨️ Maintained carousel focus in new tab: ${window.tabs[newIndex]}`);
                }, 50);
            }
        }
    }
}
