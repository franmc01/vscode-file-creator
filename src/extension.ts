// extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('fileCreator.createFileWithTemplate', () => {
        const panel = vscode.window.createWebviewPanel(
            'createFilePanel',
            'Create New File',
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        const config = vscode.workspace.getConfiguration('fileCreator');
        const enableTemplates = config.get<boolean>('enableTemplates', true);
        const userTemplates = config.get<{ label: string; extension: string; icon?: string }[]>('templates', []);

        const defaultTemplates = [
            { label: "HTML", extension: ".html", icon: "📄" },
            { label: "CSS", extension: ".css", icon: "🎨" },
            { label: "JavaScript", extension: ".js", icon: "🟨" },
            { label: "TypeScript", extension: ".ts", icon: "🟦" }
        ];

        const templates = userTemplates.length > 0 ? userTemplates : defaultTemplates;

        panel.webview.html = getWebviewContent(enableTemplates, templates);

        panel.webview.onDidReceiveMessage(
            async (message) => {
                if (message.command === 'createFile') {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri;
                    if (!workspaceFolder) {
                        vscode.window.showErrorMessage('No open project found.');
                        return;
                    }
                    let filename = message.filename.trim();
                    let extension = message.extension;

                    if (filename.includes('.')) {
                        extension = '';
                    }
                    
                    const fileUri = vscode.Uri.joinPath(workspaceFolder, `${filename}${extension}`);
                    await vscode.workspace.fs.writeFile(fileUri, new Uint8Array());
                    vscode.window.showTextDocument(fileUri);
                    panel.dispose();
                }
                if (message.command === 'close') {
                    panel.dispose();
                }
            },
            undefined,
            context.subscriptions
        );
    });

    let openSettingsDisposable = vscode.commands.registerCommand('fileCreator.openSettings', async () => {
        const settingsUri = vscode.Uri.joinPath(
            vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(''),
            '.vscode',
            'settings.json'
        );
    
        try {
            const document = await vscode.workspace.openTextDocument(settingsUri);
            await vscode.window.showTextDocument(document);
        } catch (error) {
            vscode.window.showErrorMessage("Could not open settings.json. Make sure the file exists in your .vscode folder.");
        }
    });
    
    context.subscriptions.push(openSettingsDisposable); 
    context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent(enableTemplates: boolean, templates: { label: string; extension: string; icon?: string }[]): string {
    return `
    <html>
    <head>
        <style>
            body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: var(--vscode-font-family);
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                margin: 0;
            }
            .container {
                background: var(--vscode-editorWidget-background);
                padding: 12px;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
                opacity: 1;
                transform: scale(1);
                max-width: 280px;
                width: 100%;
                overflow: hidden;
            }
            input {
                padding: 6px;
                width: 95%;
                border: 1px solid var(--vscode-input-border);
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                font-family: var(--vscode-font-family);
                font-size: 0.9em;
                border-radius: 4px;
                outline: none;
                box-shadow: none;
                margin: 0;
            }
            input::placeholder {
                color: var(--vscode-editorHint-foreground);
                opacity: 0.6;
            }
            #fileTypeList {
                list-style: none;
                padding: 0;
                margin: 8px 0 0 0;
                width: 100%;
                background: var(--vscode-editorWidget-background);
                border-radius: 4px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                display: ${enableTemplates ? 'block' : 'none'};
                font-family: var(--vscode-font-family);
            }
            li {
                padding: 6px;
                cursor: pointer;
                border-bottom: 1px solid var(--vscode-editorWidget-border);
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: var(--vscode-font-family);
            }
            li:last-child {
                border-bottom: none;
            }
            li:hover, .selected {
                background: var(--vscode-list-activeSelectionBackground) !important;
                color: var(--vscode-list-activeSelectionForeground) !important;
            }
        </style>
    </head>
    <body>
        <div class="container" id="popup">
            <input type="text" id="filename" placeholder="Example: index.js or index - Define file name" autofocus />
            <ul id="fileTypeList">
                ${templates.map((template, index) => `
                    <li data-ext="${template.extension}" class="${index === 0 ? 'selected' : ''}" onclick="selectTemplate(${index})">
                        <span>${template.icon || "📁"}</span> ${template.label}
                    </li>
                `).join('')}
            </ul>
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            const input = document.getElementById('filename');
            const fileTypeList = document.getElementById('fileTypeList');
            let selectedIndex = 0;
            const items = fileTypeList ? fileTypeList.getElementsByTagName('li') : [];
            input.focus();
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    createFile();
                } else if (event.key === 'Escape') {
                    closePopup();
                } else if (event.key === 'ArrowDown' && items.length) {
                    updateSelection(1);
                } else if (event.key === 'ArrowUp' && items.length) {
                    updateSelection(-1);
                }
            });
            function updateSelection(direction) {
                items[selectedIndex].classList.remove('selected');
                selectedIndex = (selectedIndex + direction + items.length) % items.length;
                items[selectedIndex].classList.add('selected');
            }
            function selectTemplate(index) {
                items[selectedIndex].classList.remove('selected');
                selectedIndex = index;
                items[selectedIndex].classList.add('selected');
            }
            function createFile() {
                let filename = input.value.trim();
                if (!filename) return;
                let extension = items.length ? items[selectedIndex].dataset.ext : '';
                vscode.postMessage({ command: 'createFile', filename, extension });
            }
            function closePopup() {
                vscode.postMessage({ command: 'close' });
            }
        </script>
    </body>
    </html>`;
}