import EditableArray from "../nodes/editable-array.js";
export default class EditableArrayComponent extends HTMLElement {
    constructor() {
        super();
        this.editable = new EditableArray(this);
    }
    connectedCallback() {
        this.editable.connect();
    }
    disconnectedCallback() {
        this.editable.disconnect();
    }
}
customElements.define("editable-array", EditableArrayComponent);
//# sourceMappingURL=editable-array-component.js.map