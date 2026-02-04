// ===== Export Manager =====
class ExportManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.init();
    }
    
    init() {
        document.getElementById('exportBtn').addEventListener('click', () => this.exportMeme());
        
        // Border controls
        document.getElementById('borderStyle').addEventListener('change', () => this.canvasManager.render());
        document.getElementById('borderWidth').addEventListener('input', (e) => {
            document.getElementById('borderWidthValue').textContent = e.target.value + 'px';
            this.canvasManager.render();
        });
        document.getElementById('borderColor').addEventListener('input', () => this.canvasManager.render());
    }
    
    exportMeme() {
        if (!this.canvasManager.image) {
            alert('Please upload an image first!');
            return;
        }
        
        const format = document.getElementById('exportFormat').value;
        const quality = parseInt(document.getElementById('exportQuality').value);
        
        try {
            // Create high-resolution export canvas
            const exportCanvas = document.createElement('canvas');
            const exportCtx = exportCanvas.getContext('2d');
            
            // Scale canvas for high quality
            const width = this.canvasManager.canvas.width * quality;
            const height = this.canvasManager.canvas.height * quality;
            exportCanvas.width = width;
            exportCanvas.height = height;
            
            // Scale context
            exportCtx.scale(quality, quality);
            
            // Draw background image
            if (this.canvasManager.image) {
                exportCtx.drawImage(
                    this.canvasManager.image,
                    0, 0,
                    this.canvasManager.canvas.width,
                    this.canvasManager.canvas.height
                );
            }
            
            // Apply border
            const borderStyle = document.getElementById('borderStyle').value;
            const borderWidth = parseInt(document.getElementById('borderWidth').value);
            const borderColor = document.getElementById('borderColor').value;
            
            if (borderStyle !== 'none' && borderWidth > 0) {
                exportCtx.save();
                exportCtx.strokeStyle = borderColor;
                exportCtx.lineWidth = borderWidth;
                
                if (borderStyle === 'dashed') {
                    exportCtx.setLineDash([15, 10]);
                } else if (borderStyle === 'glow') {
                    exportCtx.shadowColor = borderColor;
                    exportCtx.shadowBlur = borderWidth * 2;
                }
                
                exportCtx.strokeRect(
                    borderWidth / 2,
                    borderWidth / 2,
                    this.canvasManager.canvas.width - borderWidth,
                    this.canvasManager.canvas.height - borderWidth
                );
                exportCtx.restore();
            }
            
            // Draw all layers
            this.canvasManager.layers.forEach(layer => {
                this.drawLayerOnExport(exportCtx, layer);
            });
            
            // Convert to blob and download
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            const qualityValue = format === 'jpg' ? 0.95 : undefined;
            
            exportCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mememama-${Date.now()}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showExportSuccess();
            }, mimeType, qualityValue);
            
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export meme. Please try again.');
        }
    }
    
    drawLayerOnExport(ctx, layer) {
        ctx.save();
        
        if (layer.type === 'text') {
            ctx.font = `${layer.bold ? 'bold' : ''} ${layer.italic ? 'italic' : ''} ${layer.fontSize}px ${layer.fontFamily}`;
            ctx.fillStyle = layer.color;
            ctx.textBaseline = 'top';
            
            // Shadow
            if (layer.shadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;
            }
            
            // Stroke
            if (layer.strokeWidth > 0) {
                ctx.strokeStyle = layer.strokeColor;
                ctx.lineWidth = layer.strokeWidth;
                ctx.lineJoin = 'round';
                ctx.strokeText(layer.text, layer.x, layer.y);
            }
            
            ctx.fillText(layer.text, layer.x, layer.y);
        } else if (layer.type === 'emoji') {
            const size = layer.size || 60;
            ctx.font = `${size}px Arial`;
            ctx.textBaseline = 'top';
            ctx.fillText(layer.emoji, layer.x, layer.y);
        }
        
        ctx.restore();
    }
    
    showExportSuccess() {
        // Create success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, var(--success), #059669);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            font-weight: 600;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Meme exported successfully!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add animations to document
if (!document.querySelector('#export-animations')) {
    const style = document.createElement('style');
    style.id = 'export-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize export manager
const exportManager = new ExportManager(canvasManager);
