# 🎯 App Grid Organizer

A powerful, visual widget-based application for text manipulation and prompt engineering. Build complex text processing workflows by connecting widgets in an intuitive drag-and-drop interface.

## ✨ Features

### 🧩 Widget-Based Architecture
- **Drag & Drop Interface**: Easily position widgets anywhere on the grid
- **Dynamic Sizing**: Widgets automatically resize based on their content
- **Connection System**: Link widgets together to create processing pipelines
- **Real-time Updates**: All changes are automatically saved

### 📝 Text Processing Widgets

#### Basic Widgets
- **Calculator**: Basic calculator with memory functions
- **Notes**: Simple text notes for documentation
- **Timer**: Countdown timer with play/pause controls
- **Counter**: Increment/decrement counter

#### Text Manipulation Suite
- **Text Field**: Labeled input field for capturing text values
- **Combine Text**: Join multiple text inputs with customizable separators  
- **Add Text**: Insert text at the beginning, end, or middle of existing text
- **Remove Text**: Remove specific text patterns (all, first, or last occurrence)
- **Replace Text**: Find and replace functionality with multiple modes
- **Transform Text**: Case transformations, reverse, trim, and space normalization
- **Prompt Template**: Template system with variables for prompt engineering

### 🔗 Advanced Features
- **Collapsible Widget Categories**: Organized palette with expandable sections
- **Auto-Resize**: Widgets grow dynamically (Combine Text adds inputs, Prompt Template expands with variables)
- **Connection Visualization**: Visual lines show data flow between widgets
- **Responsive Design**: Clean, modern interface that works on different screen sizes

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   ```
   http://localhost:5173/
   ```

## 🎮 How to Use

1. **Add Widgets**: Expand categories in the left panel and click to add widgets
2. **Position Widgets**: Drag widgets around the grid to organize your workspace  
3. **Create Connections**: Hover over widgets and drag from output (→) to input (←) points
4. **Build Workflows**: Chain text widgets together for complex processing
5. **Auto-Save**: All changes are automatically saved to localStorage

## 🛠️ Example Workflows

### Prompt Engineering Pipeline
1. Add a **Text Field** for base context
2. Use **Add Text** to prepend instructions
3. Connect to **Prompt Template** with variables
4. Use **Transform Text** to format the final output

### Text Processing Chain
1. Start with **Combine Text** to merge multiple sources
2. Use **Replace Text** to clean up unwanted patterns
3. Apply **Transform Text** for case/formatting
4. End with **Notes** to document the result

## 🏗️ Build for Production

```bash
npm run build
```

## 🎨 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Phosphor Icons** for beautiful iconography
- **Custom Grid System** for widget management

## 📄 License

MIT License - see LICENSE file for details.
