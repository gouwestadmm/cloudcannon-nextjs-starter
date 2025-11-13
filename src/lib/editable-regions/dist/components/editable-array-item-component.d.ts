import EditableArrayItem from "../nodes/editable-array-item.js";
export default class EditableArrayItemComponent extends HTMLElement {
    editable: EditableArrayItem;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-array-item": EditableArrayItemComponent;
    }
}
//# sourceMappingURL=editable-array-item-component.d.ts.map