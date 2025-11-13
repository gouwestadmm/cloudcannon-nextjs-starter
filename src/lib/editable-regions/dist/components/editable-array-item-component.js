import EditableArrayItem from "../nodes/editable-array-item.js";
export default class EditableArrayItemComponent extends HTMLElement {
    constructor() {
        super();
        this.editable = new EditableArrayItem(this);
    }
    connectedCallback() {
        this.editable.connect();
    }
    disconnectedCallback() {
        this.editable.disconnect();
    }
}
customElements.define("editable-array-item", EditableArrayItemComponent);
//# sourceMappingURL=editable-array-item-component.js.map