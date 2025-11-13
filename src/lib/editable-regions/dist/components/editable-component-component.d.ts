import EditableComponent from "../nodes/editable-component.js";
export default class EditableComponentComponent extends HTMLElement {
    editable: EditableComponent;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-component": EditableComponentComponent;
    }
}
//# sourceMappingURL=editable-component-component.d.ts.map