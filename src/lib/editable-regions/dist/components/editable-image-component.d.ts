import EditableImage from "../nodes/editable-image.js";
export default class EditableImageComponent extends HTMLElement {
    editable: EditableImage;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-image": EditableImageComponent;
    }
}
//# sourceMappingURL=editable-image-component.d.ts.map