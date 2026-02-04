// ===== Auto Background Removal Manager =====
class AutoBgRemoveManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.model = null;
        this.isModelLoaded = false;
        this.init();
    }
    
    init() {
        document.getElementById('autoRemoveBgBtn').addEventListener('click', () => this.removeBackground());
    }
    
    async loadModel() {
        if (this.isModelLoaded) return;
        
        try {
            this.showLoading('Loading AI model...');
            
            // Load BodyPix model
            this.model = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.75,
                quantBytes: 2
            });
            
            this.isModelLoaded = true;
            this.hideLoading();
        } catch (error) {
            console.error('Error loading model:', error);
            this.hideLoading();
            alert('Failed to load AI model. Please try again or use manual removal.');
        }
    }
    
    async removeBackground() {
        if (!this.canvasManager.image) {
            alert('Please upload an image first!');
            return;
        }
        
        try {
            // Load model if not loaded
            if (!this.isModelLoaded) {
                await this.loadModel();
            }
            
            this.showLoading('Removing background...');
            
            // Create temporary canvas with original image
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.canvasManager.canvas.width;
            tempCanvas.height = this.canvasManager.canvas.height;
            tempCtx.drawImage(this.canvasManager.image, 0, 0, tempCanvas.width, tempCanvas.height);
            
            // Perform segmentation
            const segmentation = await this.model.segmentPerson(tempCanvas, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.5
            });
            
            // Create mask
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const pixels = imageData.data;
            
            // Apply mask - make background transparent
            for (let i = 0; i < pixels.length; i += 4) {
                const pixelIndex = i / 4;
                if (!segmentation.data[pixelIndex]) {
                    // Background pixel - make transparent
                    pixels[i + 3] = 0;
                }
            }
            
            tempCtx.putImageData(imageData, 0, 0);
            
            // Convert canvas to image
            const img = new Image();
            img.onload = () => {
                this.canvasManager.image = img;
                this.canvasManager.saveState();
                this.canvasManager.render();
                this.hideLoading();
            };
            img.src = tempCanvas.toDataURL();
            
        } catch (error) {
            console.error('Error removing background:', error);
            this.hideLoading();
            alert('Failed to remove background. Please try manual removal instead.');
        }
    }
    
    showLoading(text) {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = overlay.querySelector('.loading-text');
        loadingText.textContent = text;
        overlay.classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

// Initialize auto background removal
const autoBgRemoveManager = new AutoBgRemoveManager(canvasManager);
