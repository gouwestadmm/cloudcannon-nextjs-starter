import EditableImage from "../nodes/editable-image.js";
export default class EditableImageComponent extends HTMLElement {
    constructor() {
        super();
        this.editable = new EditableImage(this);
    }
    connectedCallback() {
        this.editable.connect();
    }
    disconnectedCallback() {
        this.editable.disconnect();
    }
}
customElements.define("editable-image", EditableImageComponent);
//# sourceMappingURL=editable-image-component.js.map