export default class EditableComponentControls extends HTMLElement {
    protected shadow?: ShadowRoot;
    protected contextMenu?: HTMLUListElement;
    protected buttonRow?: HTMLDivElement;
    private editButton?;
    render(shadow: ShadowRoot): void;
    connectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-component-controls": EditableComponentControls;
    }
}
//# sourceMappingURL=editable-component-controls.d.ts.map