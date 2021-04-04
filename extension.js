// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

function activate(context) {

	let disposable = vscode.commands.registerCommand('extension.goToHookDefinition', async function (fileUri) {

		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		const text = editor.document.getText(selection);
		const currentLine = editor.document.lineAt(editor.selection.active.line)._text;

		let type = '';
		const actionNames = ['add_action', 'do_action', 'add_filter', 'apply_filters'];
		const position = editor.selection.active;
		const currentLocation = currentLine.slice(0, position._character);
		const tagCount = currentLocation.match(new RegExp(text, 'g')).length;
		
		if(tagCount > 1) {
			type = 'function';
		} else {
			const regex = /(\w)+/ig;
			const check = currentLocation.match(regex);
			const index = check.findIndex((item) => item === text);
			if(index > 1) {
				type = 'function';
			} else {
				actionNames.forEach(action => {
					if(currentLocation.includes(action)) {
						type = action;
					}
				})
			}
		}

		if(type === 'function') {
			const location = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', fileUri);
	
			if(location) {
				const foundFunction = [];
				location.forEach(item => {
					if(item.children.length > 0) {
						item.children.forEach(val => {
							foundFunction.push(val.name.includes(text));
						})
					} else {
						foundFunction.push(item.name.includes(text));
					}
				})
				const existFunctionInThisFile = foundFunction.includes(true);
	
				if(existFunctionInThisFile) {
					location.forEach((item) => {
						if(item.name === text) {
							const lineNumber = item.range._start._line;
							vscode.commands.executeCommand('editor.action.goToLocations', vscode.window.activeTextEditor.document.uri, new vscode.Position(lineNumber, 0), []);
						} else {
							item.children.forEach((val) => {
								if(val.name === text) {
									const lineNumber = val.range._start._line;
									vscode.commands.executeCommand('editor.action.goToLocations', vscode.window.activeTextEditor.document.uri, new vscode.Position(lineNumber, 0), []);
								}
							})
						}
					})
				} else {
					vscode.commands.executeCommand('workbench.action.findInFiles', {
						query: 'function\\s+' + text,
						triggerSearch: true,
						isRegex: true,
						isCaseSensitive: false,
						matchWholeWord: false
					});
				}
			} else {
				vscode.commands.executeCommand('workbench.action.findInFiles', {
					query: 'function\\s+' + text,
					triggerSearch: true,
					isRegex: true,
					isCaseSensitive: false,
					matchWholeWord: false
				});
			}
		} else {
			if(type === 'add_action') {
				vscode.commands.executeCommand('workbench.action.findInFiles', {
					query: 'do_action(\\s+)?\\((\\s+)?\'' + text,
					triggerSearch: true,
					isRegex: true,
					isCaseSensitive: false,
					matchWholeWord: false
				});
			} else if(type === 'do_action') {
				vscode.commands.executeCommand('workbench.action.findInFiles', {
					query: 'add_action(\\s+)?\\((\\s+)?\'' + text,
					triggerSearch: true,
					isRegex: true,
					isCaseSensitive: false,
					matchWholeWord: false
				});
			} else if(type === 'add_filter') {
				vscode.commands.executeCommand('workbench.action.findInFiles', {
					query: 'apply_filters(\\s+)?\\((\\s+)?\'' + text,
					triggerSearch: true,
					isRegex: true,
					isCaseSensitive: false,
					matchWholeWord: false
				});
			} else if(type === 'apply_filters') {
				vscode.commands.executeCommand('workbench.action.findInFiles', {
					query: 'add_filter(\\s+)?\\((\\s+)?\'' + text,
					triggerSearch: true,
					isRegex: true,
					isCaseSensitive: false,
					matchWholeWord: false
				});
			}
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
