import EditableComponent from "../nodes/editable-component.js";
export default class EditableComponentComponent extends HTMLElement {
    constructor() {
        super();
        this.editable = new EditableComponent(this);
    }
    connectedCallback() {
        this.editable.connect();
    }
    disconnectedCallback() {
        this.editable.disconnect();
    }
}
customElements.define("editable-component", EditableComponentComponent);
//# sourceMappingURL=editable-component-component.js.map