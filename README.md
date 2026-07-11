# 🎨 MemeMama - Professional Meme Generator

A feature-rich, professional meme generator built with vanilla JavaScript, HTML5 Canvas, and TensorFlow.js. Create viral-worthy memes with powerful editing tools and AI-powered background removal.

## ✨ Features

### 🖼️ Image Handling
- **Upload Images**: Support for JPG and PNG formats
- **Drag & Drop**: Easy file upload interface
- **Canvas Preview**: Real-time preview with zoom and pan
- **High-Quality Export**: Export in multiple resolutions (1x, 2x, 3x)

### ✍️ Text Tools
- **Multiple Text Layers**: Add unlimited text overlays
- **Custom Fonts**: Google Fonts integration (Impact, Arial Black, Comic Sans MS, Playfair Display, DM Sans, JetBrains Mono, Bebas Neue, Montserrat)
- **Text Styling**: 
  - Font size (12-120px)
  - Color picker
  - Stroke/outline with adjustable width
  - Text shadow
  - Bold and italic styles
- **Interactive Editing**: Drag, resize, and position text anywhere

### 🎭 Background Removal
- **Auto Remove**: AI-powered background removal using TensorFlow.js BodyPix
- **Manual Erase**: Brush tool for precise background removal
  - Adjustable brush size
  - Erase and restore modes
  - Real-time preview

### 🎨 Decorations
- **Borders**: Multiple styles (solid, dashed, glow)
- **Emojis**: Quick-access emoji panel (😂🔥💀😎❤️💯🤣👀🙏✨🎉😭)
- **Stickers**: Easy drag-and-drop stickers
- **Custom Effects**: Outline effects and shadows

### 🛠️ Professional Tools
- **Undo/Redo**: Full history support (50 states)
- **Layers Panel**: Manage and organize all elements
- **Zoom & Pan**: Precise editing with zoom controls
- **Keyboard Shortcuts**:
  - `Ctrl+Z`: Undo
  - `Ctrl+Y`: Redo
  - `Delete`: Delete selected layer
  - `Ctrl+T`: Add text
- **Dark/Light Mode**: Toggle between themes with persistent storage

### 📤 Export
- **Formats**: PNG and JPG
- **Quality Options**: Standard (1x), High (2x), Ultra (3x)
- **High Resolution**: Crisp, professional output

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Canvas**: HTML5 Canvas API
- **AI/ML**: TensorFlow.js, BodyPix
- **Fonts**: Google Fonts API
- **Deployment**: GitHub Pages / Netlify ready

## 💻 Live Preview 

https://akash098p.github.io/Meme-Mama-Generator/

## 🎯 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://akash098p.github.io/MemeMamaGenerator.git
cd MemeMamaGenerator 
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Navigate to `http://localhost:8000`

### Usage

1. **Upload an Image**: Click the upload button or drag and drop an image
2. **Add Text**: Click "Add Text" and customize using the text controls
3. **Add Emojis**: Click any emoji to add it to your meme
4. **Remove Background**: Use Auto Remove (AI) or Manual Erase tools
5. **Apply Decorations**: Add borders and effects
6. **Export**: Choose format and quality, then download your meme

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with smooth animations
- **Theme Support**: Dark and light modes with seamless transitions
- **Responsive**: Works on desktop and tablet devices
- **Accessibility**: Keyboard shortcuts and clear visual feedback
- **Performance**: Optimized canvas rendering and state management

## 🔧 Advanced Features

### Undo/Redo System
- Maintains history of up to 50 states
- Efficient state serialization
- Visual feedback for available actions

### Layer Management
- Visual layer panel showing all elements
- Click to select layers
- Delete layers with visual confirmation
- Active layer highlighting

### Zoom & Pan
- Smooth zoom in/out
- Mouse wheel zoom support
- Reset zoom to default
- Pan while maintaining layer positions

## 🌟 Resume Boosters

- ✅ Complex state management
- ✅ AI/ML integration (TensorFlow.js)
- ✅ Canvas API mastery
- ✅ Undo/Redo implementation
- ✅ Theme system with CSS variables
- ✅ Keyboard shortcut system
- ✅ Layer management system
- ✅ High-resolution export
- ✅ Professional UI/UX design
- ✅ Responsive design patterns

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Background removal works best with clear subject-background separation
- Large images may take time to process with AI background removal
- Mobile support is limited (optimized for desktop/tablet)

## 🚧 Future Enhancements

- [ ] More sticker packs
- [ ] Custom font upload
- [ ] Templates gallery
- [ ] Social media integration
- [ ] Batch processing
- [ ] Mobile app version
- [ ] Video meme support

## 👨‍💻 Author

Akash Pramanik 

---

**Star ⭐ this repo if you found it helpful!**
