// ===== Text Tools Manager =====
class TextToolsManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.init();
    }
    
    init() {
        // Add text button
        document.getElementById('addTextBtn').addEventListener('click', () => this.addText());
        
        // Text controls
        document.getElementById('textContent').addEventListener('input', (e) => this.updateSelectedText());
        document.getElementById('fontFamily').addEventListener('change', () => this.updateSelectedText());
        document.getElementById('fontSize').addEventListener('input', (e) => {
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
            this.updateSelectedText();
        });
        document.getElementById('textColor').addEventListener('input', () => this.updateSelectedText());
        document.getElementById('strokeWidth').addEventListener('input', (e) => {
            document.getElementById('strokeValue').textContent = e.target.value + 'px';
            this.updateSelectedText();
        });
        document.getElementById('strokeColor').addEventListener('input', () => this.updateSelectedText());
        document.getElementById('textShadow').addEventListener('change', () => this.updateSelectedText());
        document.getElementById('textBold').addEventListener('change', () => this.updateSelectedText());
        document.getElementById('textItalic').addEventListener('change', () => this.updateSelectedText());
        
        // Emoji buttons
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                this.addEmoji(emoji);
            });
        });
        
        // Load Google Fonts
        this.loadGoogleFonts();
    }
    
    loadGoogleFonts() {
        const fonts = [
            'Bebas+Neue',
            'Montserrat:wght@400;700;900'
        ];
        
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
    
    addText() {
        const text = document.getElementById('textContent').value || 'Your Text Here';
        const fontFamily = document.getElementById('fontFamily').value;
        const fontSize = parseInt(document.getElementById('fontSize').value);
        const color = document.getElementById('textColor').value;
        const strokeWidth = parseInt(document.getElementById('strokeWidth').value);
        const strokeColor = document.getElementById('strokeColor').value;
        const shadow = document.getElementById('textShadow').checked;
        const bold = document.getElementById('textBold').checked;
        const italic = document.getElementById('textItalic').checked;
        
        const layer = {
            type: 'text',
            text: text,
            x: this.canvasManager.canvas.width / 2 - 100,
            y: this.canvasManager.canvas.height / 2 - fontSize / 2,
            fontFamily: fontFamily,
            fontSize: fontSize,
            color: color,
            strokeWidth: strokeWidth,
            strokeColor: strokeColor,
            shadow: shadow,
            bold: bold,
            italic: italic
        };
        
        this.canvasManager.addLayer(layer);
        
        // Show text controls if hidden
        document.getElementById('textControls').classList.remove('hidden');
    }
    
    updateSelectedText() {
        const selected = this.canvasManager.selectedLayer;
        if (!selected || selected.type !== 'text') return;
        
        selected.text = document.getElementById('textContent').value || 'Your Text Here';
        selected.fontFamily = document.getElementById('fontFamily').value;
        selected.fontSize = parseInt(document.getElementById('fontSize').value);
        selected.color = document.getElementById('textColor').value;
        selected.strokeWidth = parseInt(document.getElementById('strokeWidth').value);
        selected.strokeColor = document.getElementById('strokeColor').value;
        selected.shadow = document.getElementById('textShadow').checked;
        selected.bold = document.getElementById('textBold').checked;
        selected.italic = document.getElementById('textItalic').checked;
        
        this.canvasManager.render();
    }
    
    addEmoji(emoji) {
        const layer = {
            type: 'emoji',
            emoji: emoji,
            x: this.canvasManager.canvas.width / 2 - 30,
            y: this.canvasManager.canvas.height / 2 - 30,
            size: 60
        };
        
        this.canvasManager.addLayer(layer);
    }
}

// Initialize text tools
const textToolsManager = new TextToolsManager(canvasManager);
