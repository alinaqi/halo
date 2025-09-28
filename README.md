# Halo Desktop

## AI-Powered Desktop Assistant for Everyone

Halo is a user-friendly desktop application that brings the power of AI to your fingertips. Built with Electron and React, it provides a seamless interface for AI-powered productivity without requiring technical expertise.

![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

## ✨ Features

### Current (Phase 1)
- **🔐 Secure Authentication**: Connect with your Anthropic API key or use Quick Start mode
- **📁 File Management**: Built-in file explorer with create, edit, delete, and search capabilities
- **💾 Secure Storage**: API keys are encrypted and stored locally using Electron's secure storage
- **🎨 Modern UI**: Clean, intuitive interface designed for non-technical users

### Coming Soon
- **💬 Chat Interface**: Natural language interaction with AI (Phase 1.3)
- **✅ Task Management**: AI-powered task tracking and automation (Phase 1.4)
- **🧠 Memory System**: Context retention across sessions (Phase 1.5)
- **🚀 Advanced Automation**: Code generation, data analysis, and more (Phase 2)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- An Anthropic API key (optional - Quick Start mode available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alinaqi/halo.git
cd halo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
Create a `.env` file in the root directory:
```env
ANTHROPIC_API_KEY=your_api_key_here
```

4. Start the application:
```bash
npm run dev
```

### Building for Production

#### Build for your current platform:
```bash
npm run build
npm run dist
```

#### Build for specific platforms:
```bash
# macOS
npm run dist:mac

# Windows
npm run dist:win

# Linux
npm run dist:linux
```

## 🏗️ Architecture

Halo is built with a modern, secure architecture:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Desktop Framework**: Electron
- **Build Tool**: Vite
- **AI Integration**: Anthropic SDK
- **Security**: Electron's contextIsolation and secure IPC

### Project Structure
```
halo/
├── electron/           # Electron main process
│   ├── main.cjs       # Main entry point
│   ├── preload.cjs    # Preload script for security
│   └── services/      # Backend services
├── src/               # React application
│   ├── components/    # UI components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility libraries
├── dist/              # Production build output
└── release/           # Electron distribution packages
```

## 🔒 Security

- API keys are encrypted and stored locally using Electron's safeStorage API
- No data is sent to external servers except for AI API calls
- Context isolation ensures web content cannot access Node.js APIs directly
- All file operations are sandboxed to designated workspace directories

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- AI capabilities via [Anthropic](https://www.anthropic.com/)
- Icons from [Lucide React](https://lucide.dev/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/alinaqi/halo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/alinaqi/halo/discussions)

---

**Halo Desktop** - Making AI accessible to everyone 🚀