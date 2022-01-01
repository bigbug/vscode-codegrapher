import * as vscode from 'vscode';

export class CodeGraphProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

    private getSymbols(document: vscode.TextDocument): Thenable<vscode.DocumentSymbol[]> {
		var activeEditor = vscode.window.activeTextEditor;
		if (activeEditor !== undefined) {
		return vscode.commands
			.executeCommand<vscode.DocumentSymbol[]>(
				'vscode.executeDocumentSymbolProvider', activeEditor.document.uri)
			.then(symbols => {
				const res = [];
				if (symbols !== undefined) {
					for (const variable of symbols) {
						res.push(variable);
					}
				}
				return res;
			});
		}
		return Promise.resolve([]);
      }

	async getChildren(element?: Dependency): Promise<Dependency[]> {
        /*vscode.window.showInformationMessage("Get Children!");
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}*/

		if(element?.symbol) {
			return Promise.resolve(element.symbol.children.map(i => new Dependency(i.name, vscode.TreeItemCollapsibleState.None)));
		}

        if(!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document || vscode.window.activeTextEditor.document.languageId!=="c") {
            return Promise.resolve([]);
        }

        const res : Dependency[] = [
            new Dependency("Whole File", vscode.TreeItemCollapsibleState.None, {
                command: "vscodeCodeGrapher.activeWindow",
                title: "Open",
            })
        ];
        const symbols = await this.getSymbols(vscode.window.activeTextEditor.document);

        if(symbols) {
            symbols.forEach(i=>{
                res.push(new Dependency(i.name, vscode.TreeItemCollapsibleState.None, {
					title: "Open",
					command: "vscodeCodeGrapher.activeWindow",
					arguments: [i]
				}));
            });
        }

        return Promise.resolve(res);
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		public readonly symbol?: vscode.DocumentSymbol
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}`;
		this.description = "";
	}

	/*iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};*/
}