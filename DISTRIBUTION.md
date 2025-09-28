# Halo Desktop - Distribution Guide

## 🚀 For End Users

### Installation

#### macOS
1. Download `Halo-1.0.0.dmg` from the releases page
2. Open the DMG file
3. Drag Halo to your Applications folder
4. Launch Halo from Applications
5. If you see a security warning, go to System Preferences > Security & Privacy and click "Open Anyway"

#### Windows
1. Download `Halo-Setup-1.0.0.exe` from the releases page
2. Run the installer
3. Follow the installation wizard
4. Launch Halo from the Start Menu or Desktop shortcut

#### Linux
1. Download `Halo-1.0.0.AppImage` from the releases page
2. Make it executable: `chmod +x Halo-1.0.0.AppImage`
3. Run it: `./Halo-1.0.0.AppImage`

### First Time Setup
1. Launch Halo
2. Select your role (Project Manager, Designer, Developer, etc.)
3. Either:
   - Click "Quick Start" to use demo mode
   - Enter your Anthropic API key for full features
4. Start using Halo!

### Getting an API Key
1. Visit https://console.anthropic.com/
2. Create an account or sign in
3. Generate an API key
4. Copy the key (starts with `sk-ant-api`)
5. Paste it in Halo's Settings

## 🔨 For Developers

### Building from Source

#### Prerequisites
- Node.js 18+ and npm
- Git

#### Clone and Setup
```bash
git clone https://github.com/alinaqi/halo.git
cd halo
npm install
```

#### Development
```bash
npm run dev
```

#### Building Installers

##### Build for your current platform:
```bash
npm run dist
```

##### Build for specific platforms:
```bash
# macOS (requires macOS)
npm run dist:mac

# Windows (can be built on any platform)
npm run dist:win

# Linux
npm run dist:linux

# All platforms (requires macOS for mac build)
npm run dist:all
```

### Build Output
Built installers will be in the `release` directory:
- **macOS**: `Halo-{version}.dmg` and `Halo-{version}-mac.zip`
- **Windows**: `Halo Setup {version}.exe` and portable version
- **Linux**: `Halo-{version}.AppImage`, `.deb`, and `.rpm`

### Auto-Updates
The app includes auto-update functionality:
- Checks for updates on startup
- Checks every 4 hours while running
- Downloads updates in background
- Prompts user to install

### Distribution Channels

#### GitHub Releases (Recommended)
1. Create a new release on GitHub
2. Upload the built installers
3. Auto-updater will detect new versions

#### Direct Distribution
Simply share the installer files directly with users.

### Code Signing (Optional)

#### macOS
1. Get an Apple Developer certificate
2. Set environment variables:
   ```bash
   export CSC_LINK=path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   ```
3. Build with: `npm run dist:mac`

#### Windows
1. Get a code signing certificate
2. Set environment variables:
   ```bash
   export WIN_CSC_LINK=path/to/certificate.pfx
   export WIN_CSC_KEY_PASSWORD=your_password
   ```
3. Build with: `npm run dist:win`

### Troubleshooting

#### macOS Security Warning
If users see "cannot be opened because the developer cannot be verified":
1. Right-click the app and select "Open"
2. Or go to System Preferences > Security & Privacy > General
3. Click "Open Anyway"

#### Windows SmartScreen
If Windows SmartScreen blocks the installer:
1. Click "More info"
2. Click "Run anyway"

#### Linux Permissions
If the AppImage won't run:
```bash
chmod +x Halo-*.AppImage
```

### Support
- Issues: https://github.com/alinaqi/halo/issues
- Discussions: https://github.com/alinaqi/halo/discussions