import EditableSource from "../nodes/editable-source.js";
export default class EditableComponentSource extends HTMLElement {
    editable: EditableSource;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-source": EditableComponentSource;
    }
}
//# sourceMappingURL=editable-source-component.d.ts.map