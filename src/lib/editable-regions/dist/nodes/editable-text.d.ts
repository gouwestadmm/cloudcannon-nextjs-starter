import Editable from "./editable.js";
type EditableFocusEvent = CustomEvent<number>;
export default class EditableText extends Editable {
    editor?: any;
    focused: boolean;
    focusIndex: number;
    value: string | null | undefined;
    validateConfiguration(): boolean;
    validateValue(value: unknown): string | null | undefined;
    shouldUpdate(value: string): boolean;
    update(): void;
    mount(): void;
    mountEditor(): Promise<any>;
    onChange(value?: string | null): void;
}
declare global {
    interface HTMLElementEventMap {
        "editable:focus": EditableFocusEvent;
        "editable:blur": EditableFocusEvent;
    }
}
export {};
//# sourceMappingURL=editable-text.d.ts.map