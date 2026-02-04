// ===== Canvas Manager =====
class CanvasManager {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.image = null;
        this.layers = [];
        this.selectedLayer = null;
        this.history = [];
        this.historyIndex = -1;
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.isResizing = false;
        this.isRotating = false;
        this.resizeHandle = null;
        
        this.init();
    }
    
    init() {
        // Setup canvas
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Theme toggle
        this.setupTheme();
        
        // Upload handler
        document.getElementById('imageUpload').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Drag and drop
        const container = document.getElementById('canvasContainer');
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.style.borderColor = 'var(--accent-primary)';
        });
        container.addEventListener('dragleave', () => {
            container.style.borderColor = 'var(--border-color)';
        });
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.style.borderColor = 'var(--border-color)';
            const file = e.dataTransfer.files[0];
            if (file && file.type.match('image.*')) {
                this.loadImage(file);
            }
        });
        
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Toolbar buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('resetZoomBtn').addEventListener('click', () => this.resetZoom());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        this.render();
    }
    
    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }
    
    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                
                // Adjust canvas to image aspect ratio
                const maxWidth = 1200;
                const maxHeight = 800;
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                this.canvas.width = width;
                this.canvas.height = height;
                
                document.getElementById('emptyState').classList.add('hidden');
                this.saveState();
                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        
        // Check if clicking on a layer
        let clickedLayer = null;
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            if (this.isPointInLayer(x, y, layer)) {
                clickedLayer = layer;
                break;
            }
        }
        
        if (clickedLayer) {
            this.selectedLayer = clickedLayer;
            this.isDragging = true;
            this.dragStart = { x: x - clickedLayer.x, y: y - clickedLayer.y };
            this.updateLayersList();
            this.render();
        } else {
            this.selectedLayer = null;
            this.updateLayersList();
            this.render();
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedLayer) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        
        this.selectedLayer.x = x - this.dragStart.x;
        this.selectedLayer.y = y - this.dragStart.y;
        
        this.render();
    }
    
    handleMouseUp() {
        if (this.isDragging && this.selectedLayer) {
            this.saveState();
        }
        this.isDragging = false;
        this.isResizing = false;
        this.isRotating = false;
    }
    
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.1, Math.min(5, this.zoom * delta));
        this.render();
    }
    
    isPointInLayer(x, y, layer) {
        if (layer.type === 'text') {
            const metrics = this.ctx.measureText(layer.text);
            const width = metrics.width;
            const height = layer.fontSize;
            
            return x >= layer.x && x <= layer.x + width &&
                   y >= layer.y - height && y <= layer.y;
        } else if (layer.type === 'emoji') {
            const size = layer.size || 60;
            return x >= layer.x && x <= layer.x + size &&
                   y >= layer.y && y <= layer.y + size;
        }
        return false;
    }
    
    handleKeyboard(e) {
        // Ctrl+Z - Undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this.undo();
        }
        // Ctrl+Y - Redo
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }
        // Delete - Delete selected layer
        if (e.key === 'Delete' && this.selectedLayer) {
            e.preventDefault();
            this.deleteLayer(this.selectedLayer);
        }
        // Ctrl+T - Add text
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            document.getElementById('addTextBtn').click();
        }
    }
    
    zoomIn() {
        this.zoom = Math.min(5, this.zoom * 1.2);
        this.render();
    }
    
    zoomOut() {
        this.zoom = Math.max(0.1, this.zoom / 1.2);
        this.render();
    }
    
    resetZoom() {
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.render();
    }
    
    clearAll() {
        if (confirm('Are you sure you want to clear everything?')) {
            this.image = null;
            this.layers = [];
            this.selectedLayer = null;
            this.history = [];
            this.historyIndex = -1;
            document.getElementById('emptyState').classList.remove('hidden');
            this.updateLayersList();
            this.render();
        }
    }
    
    addLayer(layer) {
        this.layers.push(layer);
        this.selectedLayer = layer;
        this.saveState();
        this.updateLayersList();
        this.render();
    }
    
    deleteLayer(layer) {
        const index = this.layers.indexOf(layer);
        if (index > -1) {
            this.layers.splice(index, 1);
            this.selectedLayer = null;
            this.saveState();
            this.updateLayersList();
            this.render();
        }
    }
    
    updateLayersList() {
        const layersList = document.getElementById('layersList');
        
        if (this.layers.length === 0) {
            layersList.innerHTML = '<p class="empty-layers">No layers yet</p>';
            return;
        }
        
        layersList.innerHTML = '';
        
        // Reverse to show top layers first
        [...this.layers].reverse().forEach((layer, index) => {
            const actualIndex = this.layers.length - 1 - index;
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            if (layer === this.selectedLayer) {
                layerItem.classList.add('active');
            }
            
            const layerName = layer.type === 'text' ? 
                (layer.text.substring(0, 20) + (layer.text.length > 20 ? '...' : '')) :
                layer.emoji || 'Emoji';
            
            layerItem.innerHTML = `
                <div class="layer-info">
                    <div class="layer-name">${layerName}</div>
                    <div class="layer-type">${layer.type}</div>
                </div>
                <div class="layer-actions">
                    <button class="layer-action-btn" onclick="canvasManager.deleteLayer(canvasManager.layers[${actualIndex}])">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            `;
            
            layerItem.addEventListener('click', (e) => {
                if (!e.target.closest('.layer-action-btn')) {
                    this.selectedLayer = layer;
                    this.updateLayersList();
                    this.render();
                }
            });
            
            layersList.appendChild(layerItem);
        });
    }
    
    saveState() {
        // Remove future states if we're not at the end
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Save current state
        const state = {
            image: this.image,
            layers: JSON.parse(JSON.stringify(this.layers)),
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height
        };
        
        this.history.push(state);
        this.historyIndex++;
        
        // Limit history to 50 states
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.updateUndoRedoButtons();
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
        }
    }
    
    restoreState() {
        const state = this.history[this.historyIndex];
        this.image = state.image;
        this.layers = JSON.parse(JSON.stringify(state.layers));
        this.canvas.width = state.canvasWidth;
        this.canvas.height = state.canvasHeight;
        this.selectedLayer = null;
        
        this.updateLayersList();
        this.updateUndoRedoButtons();
        this.render();
    }
    
    updateUndoRedoButtons() {
        document.getElementById('undoBtn').disabled = this.historyIndex <= 0;
        document.getElementById('redoBtn').disabled = this.historyIndex >= this.history.length - 1;
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background image
        if (this.image) {
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Apply border if set
        const borderStyle = document.getElementById('borderStyle').value;
        const borderWidth = parseInt(document.getElementById('borderWidth').value);
        const borderColor = document.getElementById('borderColor').value;
        
        if (borderStyle !== 'none' && borderWidth > 0) {
            this.ctx.save();
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = borderWidth;
            
            if (borderStyle === 'dashed') {
                this.ctx.setLineDash([15, 10]);
            } else if (borderStyle === 'glow') {
                this.ctx.shadowColor = borderColor;
                this.ctx.shadowBlur = borderWidth * 2;
            }
            
            this.ctx.strokeRect(
                borderWidth / 2,
                borderWidth / 2,
                this.canvas.width - borderWidth,
                this.canvas.height - borderWidth
            );
            this.ctx.restore();
        }
        
        // Draw all layers
        this.layers.forEach(layer => {
            this.drawLayer(layer);
        });
        
        // Draw selection box for selected layer
        if (this.selectedLayer) {
            this.drawSelectionBox(this.selectedLayer);
        }
    }
    
    drawLayer(layer) {
        this.ctx.save();
        
        if (layer.type === 'text') {
            this.ctx.font = `${layer.bold ? 'bold' : ''} ${layer.italic ? 'italic' : ''} ${layer.fontSize}px ${layer.fontFamily}`;
            this.ctx.fillStyle = layer.color;
            this.ctx.textBaseline = 'top';
            
            // Shadow
            if (layer.shadow) {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowOffsetX = 3;
                this.ctx.shadowOffsetY = 3;
            }
            
            // Stroke
            if (layer.strokeWidth > 0) {
                this.ctx.strokeStyle = layer.strokeColor;
                this.ctx.lineWidth = layer.strokeWidth;
                this.ctx.lineJoin = 'round';
                this.ctx.strokeText(layer.text, layer.x, layer.y);
            }
            
            this.ctx.fillText(layer.text, layer.x, layer.y);
        } else if (layer.type === 'emoji') {
            const size = layer.size || 60;
            this.ctx.font = `${size}px Arial`;
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(layer.emoji, layer.x, layer.y);
        }
        
        this.ctx.restore();
    }
    
    drawSelectionBox(layer) {
        this.ctx.save();
        this.ctx.strokeStyle = '#6366f1';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        if (layer.type === 'text') {
            const metrics = this.ctx.measureText(layer.text);
            const width = metrics.width;
            const height = layer.fontSize;
            
            this.ctx.strokeRect(layer.x - 5, layer.y - height - 5, width + 10, height + 10);
        } else if (layer.type === 'emoji') {
            const size = layer.size || 60;
            this.ctx.strokeRect(layer.x - 5, layer.y - 5, size + 10, size + 10);
        }
        
        this.ctx.restore();
    }
}

// Initialize canvas manager
const canvasManager = new CanvasManager();
