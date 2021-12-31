import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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

    private getSymbols(document: vscode.TextDocument): Thenable<vscode.SymbolInformation[]> {
        return vscode.commands.executeCommand<vscode.SymbolInformation[]>(
          "vscode.executeDocumentSymbolProvider",
          document.uri
        );
      }

	async getChildren(element?: Dependency): Promise<Dependency[]> {
        /*vscode.window.showInformationMessage("Get Children!");
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}*/
        if(!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document || vscode.window.activeTextEditor.document.languageId!=="c") {
            return Promise.resolve([]);
        }

        const res : Dependency[] = [
            new Dependency("Whole File", vscode.TreeItemCollapsibleState.None, {
                command: "vscode-codegrapher.helloWorld",
                title: "Open",
            })
        ];
        const symbols = await this.getSymbols(vscode.window.activeTextEditor.document);

        if(symbols) {
            symbols.forEach(i=>{
                res.push(new Dependency(i.name, vscode.TreeItemCollapsibleState.None));
            });
        }

        return Promise.resolve(res);
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}`;
		this.description = "";
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}