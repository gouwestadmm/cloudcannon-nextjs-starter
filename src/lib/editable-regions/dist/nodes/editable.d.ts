import type { CloudCannonJavaScriptV1APICollection, CloudCannonJavaScriptV1APIDataset, CloudCannonJavaScriptV1APIFile } from "@cloudcannon/javascript-api";
export interface EditableListener {
    editable: Editable;
    key?: string;
    path?: string;
}
export interface EditableContext {
    fullPath?: string;
    filePath?: string;
    isContent?: boolean;
    file?: CloudCannonJavaScriptV1APIFile;
    collection?: CloudCannonJavaScriptV1APICollection;
    dataset?: CloudCannonJavaScriptV1APIDataset;
}
export interface DOMListener {
    fn: (e: any) => void;
    event: string;
}
export interface APIListener {
    fn: (e: any) => void;
    obj: CloudCannonJavaScriptV1APIFile | CloudCannonJavaScriptV1APICollection | CloudCannonJavaScriptV1APIDataset;
}
export default class Editable {
    APIListeners: APIListener[];
    listeners: EditableListener[];
    domListeners: DOMListener[];
    value: unknown;
    parent: Editable | null;
    element: HTMLElement;
    mounted: boolean;
    connected: boolean;
    disconnecting: boolean;
    needsReconnect: boolean;
    propsBase: unknown;
    contextBase?: EditableContext;
    props: Record<string, unknown>;
    contexts: Record<string, EditableContext>;
    connectPromise?: Promise<void>;
    constructor(element: HTMLElement);
    lookupPath(path: string, obj: unknown): Promise<any>;
    lookupPathAndContext(path: string, obj: unknown, contexts?: {
        [key: string]: EditableContext;
    }): Promise<{
        value: any;
        context: EditableContext;
    }>;
    shouldUpdate(_value: unknown): boolean;
    shouldMount(): boolean;
    getNewValue(value: unknown, listener?: EditableListener, contexts?: {
        [key: string]: EditableContext;
    }): Promise<unknown>;
    pushValue(value: unknown, listener?: EditableListener, contexts?: {
        [key: string]: EditableContext;
    }): Promise<void>;
    update(): void;
    validateValue(value: unknown): unknown;
    registerListener(listener: EditableListener): void;
    deregisterListener(target: Editable): void;
    disconnect(): Promise<void>;
    connect(): void;
    addEventListener(event: string, fn: (e: any) => void): void;
    setupListeners(): void;
    handleApiEvent(e: any): void;
    executeApiCall(options: any): boolean;
    mount(): void;
    validateConfiguration(): boolean;
    dispatchSet(source: string, value: unknown): void;
    dispatchGetInputConfig(source?: string): Promise<any>;
    parseSource(source?: string): {
        collection: CloudCannonJavaScriptV1APICollection;
        file: CloudCannonJavaScriptV1APIFile;
        source: string;
        absolute: boolean;
        snippets: any[];
        dataset: CloudCannonJavaScriptV1APIDataset;
    };
}
//# sourceMappingURL=editable.d.ts.map