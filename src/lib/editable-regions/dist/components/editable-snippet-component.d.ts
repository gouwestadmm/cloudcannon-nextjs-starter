import EditableSnippet from "../nodes/editable-snippet.js";
export default class EditableSnippetComponent extends HTMLElement {
    editable: EditableSnippet;
    constructor();
    set snippetData(value: unknown);
    connectedCallback(): void;
    disconnectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-snippet": EditableSnippetComponent;
    }
}
//# sourceMappingURL=editable-snippet-component.d.ts.map