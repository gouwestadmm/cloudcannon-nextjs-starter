export default class EditableRegionErrorCard extends HTMLElement {
    private _error?;
    private shadow?;
    set error(err: unknown);
    connectedCallback(): void;
    render(shadow: ShadowRoot, error: unknown): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-region-error-card": EditableRegionErrorCard;
    }
}
//# sourceMappingURL=editable-region-error-card.d.ts.map