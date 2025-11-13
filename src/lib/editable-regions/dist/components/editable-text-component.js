import EditableText from "../nodes/editable-text.js";
export default class EditableTextComponent extends HTMLElement {
    constructor() {
        super();
        this.editable = new EditableText(this);
    }
    connectedCallback() {
        this.editable.connect();
    }
    disconnectedCallback() {
        this.editable.disconnect();
    }
}
customElements.define("editable-text", EditableTextComponent);
//# sourceMappingURL=editable-text-component.js.map