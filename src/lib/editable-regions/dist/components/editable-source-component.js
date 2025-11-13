import EditableSource from "../nodes/editable-source.js";
export default class EditableComponentSource extends HTMLElement {
    constructor() {
        super();
        this.editable = new EditableSource(this);
    }
    connectedCallback() {
        this.editable.connect();
    }
    disconnectedCallback() {
        this.editable.disconnect();
    }
}
customElements.define("editable-source", EditableComponentSource);
//# sourceMappingURL=editable-source-component.js.map