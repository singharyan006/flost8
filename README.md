<p align="center">
  <img src="assets/icon-png.png" alt="flost8 Logo" width="160">
</p>

<h1 align="center">flost8</h1>

<p align="center">
  <strong>A lightweight, always-visible desktop to-do list widget built with Electron.</strong><br>
  Stay focused. Stay productive. Never lose track of what matters.
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20-blue?style=flat-square" alt="Platform"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"></a>
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Built%20with-Electron-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
</p>

---

<p align="center">
  <img src="assets/Homescreen.png" alt="flost8 running on desktop" width="800">
</p>

<br>

## Features

- **Always On Top** — Stays visible above all other windows — never buried behind your work.
- **Instant Task Management** — Add, complete, edit, and delete tasks with zero friction.
- **Persistent Storage** — Tasks are saved locally and restored automatically on startup.
- **Theme Switching** — Seamless light & dark mode — preference remembered between sessions.
- **Draggable & Resizable** — Position and size the widget exactly how you want it.
- **Keyboard Shortcuts** — Power-user hotkeys for ultra-fast task management.
- **Glass Morphism UI** — Frameless, transparent design with backdrop blur effects.
- **System Tray** — Minimize to tray, restore with a single click.

<br>

## Screenshots

<p align="center">
  <em>Works seamlessly over any application — Discord, VS Code, browsers, and more.</em>
</p>

<table>
  <tr>
    <td align="center" width="50%">
      <img src="assets/discord.png" alt="flost8 over Discord" width="100%"><br>
      <sub><b>Over Discord</b> — Track tasks while chatting</sub>
    </td>
    <td align="center" width="50%">
      <img src="assets/editor.png" alt="flost8 over VS Code" width="100%"><br>
      <sub><b>Over VS Code</b> — Keep your to-do list visible while coding</sub>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img src="assets/web.png" alt="flost8 compact mode" width="340"><br>
      <sub><b>Compact Mode</b> — Minimal footprint when you need more screen space</sub>
    </td>
  </tr>
</table>

<br>

## Download

<p align="center">
  <a href="https://github.com/singharyan006/flost8/releases/latest/download/flost8.exe">
    <img src="https://img.shields.io/badge/⬇_Windows-flost8.exe-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows">
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/singharyan006/flost8/releases/latest/download/flost8.dmg">
    <img src="https://img.shields.io/badge/⬇_macOS-flost8.dmg-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Download for macOS">
  </a>
</p>

<p align="center">
  <sub>
    <a href="https://github.com/singharyan006/flost8/releases/latest">View all releases →</a>
  </sub>
</p>

<details>
<summary><b>Build from source</b></summary>

<br>

**Prerequisites:** [Node.js](https://nodejs.org/) v16+ and npm

```bash
# Clone & install
git clone https://github.com/singharyan006/flost8.git
cd flost8
npm install

# Run locally
npm start

# Or build an installer
npm run build:win    # Windows (.exe)
npm run build:mac    # macOS (.dmg)
npm run build:linux  # Linux (.AppImage)
```

> Built files are output to the `dist/` directory.

</details>


<br>

## Usage

### Basic Operations

- **Add task**: Type in the input field → press `Enter` or click `+`
- **Complete task**: Click the circle checkbox
- **Edit task**: Double-click the task text
- **Delete task**: Hover over a task → click the trash icon
- **Clear completed**: Click "Clear Done" in the footer

### Window Controls

- **Move**: Drag from the title bar
- **Resize**: Drag the corner handle (⋲)
- **Pin on Top**: Click the pin icon to toggle always-on-top
- **Theme**: Click the moon icon to switch light/dark
- **Close**: Click `×` to quit
- **Compact Mode**: Click the brand name to collapse/expand

### Keyboard Shortcuts

- **`Enter`**: Add new task
- **`Ctrl/⌘ + N`**: Focus input field
- **`Ctrl/⌘ + T`**: Toggle theme
- **`Ctrl/⌘ + Shift + C`**: Clear all completed tasks
- **`Escape`**: Clear input field

<br>

## Architecture

```
flost8/
├── src/
│   ├── main.js                    # Electron main process
│   ├── preload.js                 # Secure IPC bridge
│   └── renderer/
│       ├── index.html             # Main UI
│       ├── app.js                 # App entry point & state management
│       ├── styles.css             # Compiled Tailwind CSS
│       ├── components/
│       │   ├── Header.js          # Title bar, theme toggle, compact mode
│       │   ├── TaskInput.js       # Input field & stats footer
│       │   ├── TaskItem.js        # Individual task element builder
│       │   └── TaskList.js        # Task list renderer & event delegation
│       ├── services/
│       │   ├── storeService.js    # Persistence layer (electron-store)
│       │   └── taskManager.js     # Pure task CRUD functions
│       └── utils/
│           └── helpers.js         # ID generation, HTML escaping, date formatting
├── assets/
│   ├── icon-png.png               # App icon (PNG)
│   └── icon.ico                   # App icon (Windows)
├── .github/workflows/
│   └── build.yml                  # CI/CD — automated builds for Win & Mac
├── package.json
├── LICENSE
└── README.md
```

### Tech Stack

- **[Electron](https://www.electronjs.org/)** — Desktop app framework
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling
- **[electron-store](https://github.com/sindresorhus/electron-store)** — Persistent local storage
- **[electron-builder](https://www.electron.build/)** — Packaging & distribution

<br>

## Security

flost8 follows Electron security best practices:

- `nodeIntegration` is **disabled**
- `contextIsolation` is **enabled**
- All IPC goes through a secure `contextBridge` preload
- No use of the deprecated `remote` module
- User input is HTML-escaped to prevent XSS

<br>

## Customization

- **Window size**: 320 × 480 px (Resizable within 280–400 px width)
- **Theme**: Dark (Persisted between sessions)
- **Always on top**: Enabled (Can be toggled via pin icon)
- **Window position**: Remembered (Saved on close, restored on launch)

All preferences are stored via `electron-store` and persist across restarts.

<br>

## Roadmap

- [x] Always-on-top widget
- [x] System tray integration
- [x] Light & dark themes
- [x] Glass morphism UI
- [x] Keyboard shortcuts
- [x] Compact mode
- [x] CI/CD pipeline
- [ ] Auto-launch on system startup
- [ ] Task categories & tags
- [ ] Drag-and-drop reordering
- [ ] Due dates & priorities
- [ ] Cloud sync
- [ ] Task reminders & notifications
- [ ] Multiple task lists

<br>

## Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feature/amazing-feature`
3. **Commit** your changes — `git commit -m 'Add amazing feature'`
4. **Push** to the branch — `git push origin feature/amazing-feature`
5. **Open** a Pull Request

<br>

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<br>

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Storage by [electron-store](https://github.com/sindresorhus/electron-store)
- Packaged with [electron-builder](https://www.electron.build/)

---

<p align="center">
  <img src="assets/icon-png.png" alt="flost8" width="48"><br>
  <strong>Made with ❤️ by <a href="https://github.com/singharyan006">Aryan Singh</a></strong><br>
  <sub>Focus on what matters most.</sub>
</p>
