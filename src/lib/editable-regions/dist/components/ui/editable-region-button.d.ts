export default class EditableRegionButton extends HTMLElement {
    private shadow?;
    connectedCallback(): void;
    render(shadow: ShadowRoot): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-region-button": EditableRegionButton;
    }
}
//# sourceMappingURL=editable-region-button.d.ts.map