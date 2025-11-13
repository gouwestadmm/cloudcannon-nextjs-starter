import EditableComponent from "./editable-component.js";
export default class EditableSnippet extends EditableComponent {
    getComponents(): Record<string, import("../helpers/cloudcannon.js").ComponentRenderer>;
    setupListeners(): void;
    validateValue(value: unknown): unknown;
    executeApiCall(options: any): boolean;
    dispatchSnippetChange(source: string, options: any): Promise<void>;
    mount(): void;
    validateConfiguration(): boolean;
}
//# sourceMappingURL=editable-snippet.d.ts.map