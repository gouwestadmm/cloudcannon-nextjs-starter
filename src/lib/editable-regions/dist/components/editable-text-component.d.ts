import EditableText from "../nodes/editable-text.js";
export default class EditableTextComponent extends HTMLElement {
    editable: EditableText;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-text": EditableTextComponent;
    }
}
//# sourceMappingURL=editable-text-component.d.ts.map