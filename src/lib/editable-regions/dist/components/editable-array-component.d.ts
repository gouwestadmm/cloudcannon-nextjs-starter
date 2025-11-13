import EditableArray from "../nodes/editable-array.js";
export default class EditableArrayComponent extends HTMLElement {
    editable: EditableArray;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-array": EditableArrayComponent;
    }
}
//# sourceMappingURL=editable-array-component.d.ts.map