import type { ArrayDirection } from "../../nodes/editable-array";
import EditableComponentControls from "./editable-component-controls";
export default class EditableArrayItemControls extends EditableComponentControls {
    arrayDirection: ArrayDirection;
    moveBackwardText: "up" | "left";
    moveForwardText: "down" | "right";
    private _disableMoveForward;
    private _disableMoveBackward;
    private _disableRemove;
    private _disableReorder;
    private _disableAdd;
    private moveForwardButton?;
    private moveBackwardButton?;
    private deleteButton?;
    private dragHandle?;
    private duplicateButton?;
    private addButton?;
    set disableMoveForward(value: boolean);
    set disableMoveBackward(value: boolean);
    set disableRemove(value: boolean);
    set disableReorder(value: boolean);
    set disableAdd(value: boolean);
    update(): void;
    addContextMenuButton(icon: string, text: string, onClick: (e: PointerEvent) => void): HTMLButtonElement;
    render(shadow: ShadowRoot): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "editable-array-item-controls": EditableArrayItemControls;
    }
}
//# sourceMappingURL=editable-array-item-controls.d.ts.map