'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Uri, Position, CompletionList, Disposable, CompletionItem, CompletionItemKind} from 'vscode';
var path = require('path');
var _ = require('lodash');
var fetch = require('node-fetch');
var parseString = require('xml2js').parseString;
var disposableProvider;
var isProviderEnabled = false;
// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "google-complete" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposableCommand = vscode.commands.registerTextEditorCommand('extension.googleCompleteMe', (textEditor: any, edit) => {

        if (isProviderEnabled) {
            isProviderEnabled = false;
            vscode.window.setStatusBarMessage('Google Complete Me is disabled');
            Disposable.from(disposableProvider).dispose();

        } else {
            isProviderEnabled = true;
            vscode.window.setStatusBarMessage('Google Complete Me is enabled');
            var completeProvider = new CompleteProvider();
            disposableProvider = vscode.languages.registerCompletionItemProvider('*',
                completeProvider, "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z");

            let document = textEditor.document;
            let filepath = document.fileName;
            let firstSelectEnd = textEditor._selections[0].end;
            let uri = document.uri;
            let position = new Position(firstSelectEnd.line, firstSelectEnd.character);

            vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, position).then((result: CompletionItem[]) => {

            });


        }

    });

    context.subscriptions.push(disposableCommand);


}

/**
 *  CompleteProvider
 */
class CompleteProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        const lineAt = document.lineAt(position);
        const lineText = document.getText(lineAt.range);

        return new Promise((resolve, reject) => {
            var userQuery = getUserKeyIn(lineText, position);

            fetch('http://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=' + getUserKeyIn(lineText, position))
                .then(function (res) {
                    return res.text();
                }).then(function (body) {
                    parseString(body, function (err, result) {

                        if (err) {
                            vscode.window.showInformationMessage('Google Autocomplte API is not available for the query');
                            reject(err);
                        } else {
                            if (typeof _.get(result, "toplevel.CompleteSuggestion") === "undefined") {
                                reject();
                            } else {
                                var items = result.toplevel.CompleteSuggestion.map((item) => {
                                    return new vscode.CompletionItem(item.suggestion[0]["$"].data);
                                });
                                console.log(items);
                                resolve(items);
                            }

                        }

                    });

                });
        });

    }
}

function getUserKeyIn(lineText: string, position: vscode.Position): string {
    let temp = lineText.substr(0, position.character).trim().split(" ");
    return temp[temp.length - 1];
}

// this method is called when your extension is deactivated
export function deactivate() {
}