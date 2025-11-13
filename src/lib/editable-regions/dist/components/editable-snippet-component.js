import EditableSnippet from "../nodes/editable-snippet.js";
export default class EditableSnippetComponent extends HTMLElement {
    constructor() {
        super();
        this.editable = new EditableSnippet(this);
    }
    set snippetData(value) {
        this.editable.pushValue(value);
    }
    connectedCallback() {
        this.editable.connect();
    }
    disconnectedCallback() {
        this.editable.disconnect();
    }
}
customElements.define("editable-snippet", EditableSnippetComponent);
//# sourceMappingURL=editable-snippet-component.js.map