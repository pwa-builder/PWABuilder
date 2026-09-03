import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript/unstable/ast';
import { API } from 'typescript/unstable/sync';

const directBubblewrapKeyToolSource = `
import { KeyTool } from '@bubblewrap/core';
const dormantKeyTool = KeyTool;
`;
const aliasedBubblewrapKeyToolSource = `
import { KeyTool as BubblewrapKeyTool } from '@bubblewrap/core';
new BubblewrapKeyTool(helper);
`;
const namespaceBubblewrapKeyToolSource = `
import * as bubblewrap from '@bubblewrap/core/dist/lib/jdk/KeyTool.js';
new bubblewrap.KeyTool(helper);
`;
const safeKeyToolSource = `
import { SafeKeyTool } from '../services/safe-key-tool.js';
new SafeKeyTool(helper);
`;
const virtualSourcePath = fileURLToPath(
    new URL('./in-memory-key-tool-fixture.ts', import.meta.url)
);
const typeScriptProjectDirectory = fileURLToPath(new URL('..', import.meta.url));

function findBubblewrapKeyToolFindings(sourceText: string): string[] {
    return withTypeScriptSource(sourceText, findBubblewrapKeyToolFindingsInSourceFile);
}

function withTypeScriptSource<T>(
    sourceText: string,
    analyze: (sourceFile: ts.SourceFile) => T
): T {
    const normalizedVirtualSourcePath = resolve(virtualSourcePath).toLowerCase();
    const isVirtualSource = (fileName: string): boolean =>
        resolve(fileName).toLowerCase() === normalizedVirtualSourcePath;
    const api = new API({
        cwd: typeScriptProjectDirectory,
        fs: {
            fileExists: (fileName) =>
                isVirtualSource(fileName) ? true : undefined,
            readFile: (fileName) =>
                isVirtualSource(fileName) ? sourceText : undefined,
        },
    });

    try {
        const snapshot = api.updateSnapshot({ openFiles: [virtualSourcePath] });
        try {
            const project = snapshot.getDefaultProjectForFile(virtualSourcePath);
            assert.ok(project, 'expected TypeScript to create a fixture project');
            const sourceFile = project.program.getSourceFile(virtualSourcePath);
            assert.ok(sourceFile, 'expected TypeScript to parse the fixture source');
            return analyze(sourceFile);
        } finally {
            snapshot.dispose();
        }
    } finally {
        api.close();
    }
}

function findBubblewrapKeyToolFindingsInSourceFile(
    sourceFile: ts.SourceFile
): string[] {
    const namedKeyToolAliases = new Set<string>();
    const namespaceAliases = new Set<string>();
    const findings: string[] = [];

    for (const statement of sourceFile.statements) {
        if (
            !ts.isImportDeclaration(statement) ||
            !ts.isStringLiteral(statement.moduleSpecifier) ||
            !statement.moduleSpecifier.text.startsWith('@bubblewrap/core')
        ) {
            continue;
        }

        const namedBindings = statement.importClause?.namedBindings;
        if (namedBindings && ts.isNamedImports(namedBindings)) {
            for (const element of namedBindings.elements) {
                const importedName = element.propertyName?.text ?? element.name.text;
                if (importedName === 'KeyTool') {
                    namedKeyToolAliases.add(element.name.text);
                    if (!element.propertyName) {
                        findings.push(
                            `direct KeyTool import from ${statement.moduleSpecifier.text}`
                        );
                    }
                }
            }
        } else if (namedBindings && ts.isNamespaceImport(namedBindings)) {
            namespaceAliases.add(namedBindings.name.text);
        }
    }

    function visit(node: ts.Node): void {
        if (ts.isNewExpression(node)) {
            const constructor = node.expression;
            if (
                (ts.isIdentifier(constructor) &&
                    namedKeyToolAliases.has(constructor.text)) ||
                (ts.isPropertyAccessExpression(constructor) &&
                    ts.isIdentifier(constructor.expression) &&
                    namespaceAliases.has(constructor.expression.text) &&
                    constructor.name.text === 'KeyTool')
            ) {
                findings.push(node.getText(sourceFile));
            }
        }
        node.forEachChild(visit);
    }

    visit(sourceFile);
    return findings;
}

function findClassMethods(
    sourceFile: ts.SourceFile,
    methodName: string
): ts.MethodDeclaration[] {
    const methods: ts.MethodDeclaration[] = [];

    function visit(node: ts.Node): void {
        if (ts.isClassDeclaration(node)) {
            for (const member of node.members) {
                if (
                    ts.isMethodDeclaration(member) &&
                    ts.isIdentifier(member.name) &&
                    member.name.text === methodName
                ) {
                    methods.push(member);
                }
            }
        }
        node.forEachChild(visit);
    }

    visit(sourceFile);
    return methods;
}

function countSafeKeyToolConstructions(method: ts.MethodDeclaration): number {
    let count = 0;

    function visit(node: ts.Node): void {
        if (
            ts.isNewExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'SafeKeyTool'
        ) {
            count++;
        }
        node.forEachChild(visit);
    }

    visit(method);
    return count;
}

test('detector reports a direct Bubblewrap KeyTool import without construction', () => {
    assert.equal(findBubblewrapKeyToolFindings(directBubblewrapKeyToolSource).length, 1);
});

test('detector reports an aliased Bubblewrap KeyTool construction', () => {
    assert.equal(findBubblewrapKeyToolFindings(aliasedBubblewrapKeyToolSource).length, 1);
});

test('detector reports a namespaced Bubblewrap KeyTool construction', () => {
    assert.equal(
        findBubblewrapKeyToolFindings(namespaceBubblewrapKeyToolSource).length,
        1
    );
});

test('detector ignores SafeKeyTool construction', () => {
    assert.deepEqual(findBubblewrapKeyToolFindings(safeKeyToolSource), []);
});

test('bubble wrapper uses SafeKeyTool for both keytool call sites', async () => {
    const bubbleWrapperSource = await readFile(
        new URL('../services/bubbleWrapper.ts', import.meta.url),
        'utf8'
    );

    withTypeScriptSource(bubbleWrapperSource, (sourceFile) => {
        assert.deepEqual(
            findBubblewrapKeyToolFindingsInSourceFile(sourceFile),
            []
        );

        for (const methodName of ['createSigningKey', 'generateAssetLinks']) {
            const methods = findClassMethods(sourceFile, methodName);
            assert.equal(methods.length, 1, `expected one ${methodName} method`);
            assert.equal(
                countSafeKeyToolConstructions(methods[0]),
                1,
                `expected one SafeKeyTool construction in ${methodName}`
            );
        }
    });
});
