// ===== Manual Background Removal Manager =====
class ManualBgRemoveManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.isEraseMode = false;
        this.brushSize = 20;
        this.maskCanvas = null;
        this.maskCtx = null;
        this.isDrawing = false;
        this.init();
    }
    
    init() {
        // Toggle manual mode
        document.getElementById('manualRemoveBgBtn').addEventListener('click', () => this.toggleManualMode());
        
        // Brush size
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = e.target.value + 'px';
        });
        
        // Mode buttons
        document.getElementById('eraseModeBtn').addEventListener('click', () => this.setMode('erase'));
        document.getElementById('restoreModeBtn').addEventListener('click', () => this.setMode('restore'));
    }
    
    toggleManualMode() {
        this.isEraseMode = !this.isEraseMode;
        const controls = document.getElementById('manualBgControls');
        const btn = document.getElementById('manualRemoveBgBtn');
        
        if (this.isEraseMode) {
            if (!this.canvasManager.image) {
                alert('Please upload an image first!');
                this.isEraseMode = false;
                return;
            }
            
            controls.classList.remove('hidden');
            btn.style.background = 'var(--accent-primary)';
            btn.style.color = 'white';
            this.setupMaskCanvas();
            this.setMode('erase');
            this.attachCanvasListeners();
        } else {
            controls.classList.add('hidden');
            btn.style.background = '';
            btn.style.color = '';
            this.detachCanvasListeners();
            this.applyMask();
        }
    }
    
    setupMaskCanvas() {
        // Create mask canvas if it doesn't exist
        if (!this.maskCanvas) {
            this.maskCanvas = document.createElement('canvas');
            this.maskCtx = this.maskCanvas.getContext('2d');
        }
        
        this.maskCanvas.width = this.canvasManager.canvas.width;
        this.maskCanvas.height = this.canvasManager.canvas.height;
        
        // Initialize mask to fully opaque (white)
        this.maskCtx.fillStyle = 'white';
        this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
    }
    
    setMode(mode) {
        this.mode = mode;
        
        // Update button styles
        const eraseBtn = document.getElementById('eraseModeBtn');
        const restoreBtn = document.getElementById('restoreModeBtn');
        
        eraseBtn.classList.remove('active');
        restoreBtn.classList.remove('active');
        
        if (mode === 'erase') {
            eraseBtn.classList.add('active');
            this.canvasManager.canvas.style.cursor = 'crosshair';
        } else {
            restoreBtn.classList.add('active');
            this.canvasManager.canvas.style.cursor = 'cell';
        }
    }
    
    attachCanvasListeners() {
        this.canvasManager.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvasManager.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvasManager.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvasManager.canvas.addEventListener('mouseleave', this.handleMouseUp);
    }
    
    detachCanvasListeners() {
        this.canvasManager.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvasManager.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvasManager.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvasManager.canvas.removeEventListener('mouseleave', this.handleMouseUp);
        this.canvasManager.canvas.style.cursor = 'move';
    }
    
    handleMouseDown = (e) => {
        this.isDrawing = true;
        this.draw(e);
    }
    
    handleMouseMove = (e) => {
        if (!this.isDrawing) return;
        this.draw(e);
    }
    
    handleMouseUp = () => {
        this.isDrawing = false;
    }
    
    draw(e) {
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.canvasManager.zoom;
        const y = (e.clientY - rect.top) / this.canvasManager.zoom;
        
        this.maskCtx.save();
        this.maskCtx.globalCompositeOperation = this.mode === 'erase' ? 'destination-out' : 'source-over';
        this.maskCtx.fillStyle = this.mode === 'erase' ? 'rgba(0,0,0,1)' : 'white';
        this.maskCtx.beginPath();
        this.maskCtx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
        this.maskCtx.fill();
        this.maskCtx.restore();
        
        // Preview the mask on canvas
        this.previewMask();
    }
    
    previewMask() {
        const ctx = this.canvasManager.ctx;
        
        // Clear and redraw base image
        ctx.clearRect(0, 0, this.canvasManager.canvas.width, this.canvasManager.canvas.height);
        if (this.canvasManager.image) {
            ctx.drawImage(this.canvasManager.image, 0, 0, this.canvasManager.canvas.width, this.canvasManager.canvas.height);
        }
        
        // Apply mask preview
        ctx.save();
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(this.maskCanvas, 0, 0);
        ctx.restore();
        
        // Draw layers
        this.canvasManager.layers.forEach(layer => {
            this.canvasManager.drawLayer(layer);
        });
    }
    
    applyMask() {
        if (!this.maskCanvas) return;
        
        try {
            // Create temporary canvas
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.canvasManager.canvas.width;
            tempCanvas.height = this.canvasManager.canvas.height;
            
            // Draw original image
            tempCtx.drawImage(this.canvasManager.image, 0, 0, tempCanvas.width, tempCanvas.height);
            
            // Apply mask
            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(this.maskCanvas, 0, 0);
            
            // Convert to image
            const img = new Image();
            img.onload = () => {
                this.canvasManager.image = img;
                this.canvasManager.saveState();
                this.canvasManager.render();
            };
            img.src = tempCanvas.toDataURL();
            
        } catch (error) {
            console.error('Error applying mask:', error);
            alert('Failed to apply mask. Please try again.');
        }
    }
}

// Initialize manual background removal
const manualBgRemoveManager = new ManualBgRemoveManager(canvasManager);
