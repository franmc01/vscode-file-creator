# VSCode File Creator

## 📝 Description
**VSCode File Creator** is a powerful and minimalistic extension designed to streamline file creation in Visual Studio Code. Inspired by JetBrains' approach, this extension lets you quickly create files with predefined or custom templates.

## 🚀 Features
- **Quick file creation** with a sleek UI.
- **Supports predefined templates** (HTML, CSS, JavaScript, TypeScript, etc.).
- **Custom templates via `settings.json`**.
- **Auto-opens newly created files**.
- **Keyboard navigation support**.
- **Adaptive styling** matching VS Code's theme.

## 📦 Installation
1. Open **VS Code**.
2. Go to the **Extensions Marketplace** (`Ctrl + Shift + X`).
3. Search for `VSCode File Creator`.
4. Click **Install**.

Alternatively, install manually:
```sh
code --install-extension vscode-file-creator
```

## ⚙️ Usage
1. Open the **Command Palette** (`Ctrl + Shift + P` or `Cmd + Shift + P` on Mac).
2. Search for `File Creator: Create New File`.
3. Enter the file name and select a template (if enabled).
4. Press `Enter` to create and open the file.

## ⚡ Configuration
Customize the extension via `settings.json`:
```json
{
  "fileCreator.enableTemplates": true,
  "fileCreator.templates": [
    { "label": "React Component", "extension": ".jsx", "icon": "⚛️" },
    { "label": "Python Script", "extension": ".py", "icon": "🐍" }
  ]
}
```

## 🎯 Commands
| Command | Description |
|---------|-------------|
| `fileCreator.newFile` | Opens the file creation modal. |
| `fileCreator.openSettings` | Opens the extension settings. |

## 🤝 Contribute
Contributions are welcome! Feel free to fork the repo, submit issues, and open PRs.
- **GitHub Repository**: [VSCode File Creator](https://github.com/franmc01/vscode-file-creator)
- **Tag Visual Studio Code** on [GitHub Discussions](https://github.com/microsoft/vscode/discussions) to suggest adding this natively.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author
Developed by **Francmc**. Enjoy coding with **VSCode File Creator**! ✨
