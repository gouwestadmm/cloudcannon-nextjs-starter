import "../components/ui/editable-array-item-controls.js";
import type EditableArrayItemControls from "../components/ui/editable-array-item-controls.js";
import type EditableArray from "./editable-array.js";
import EditableComponent from "./editable-component.js";
export default class EditableArrayItem extends EditableComponent {
    parent: EditableArray | null;
    protected controlsElement?: EditableArrayItemControls;
    private inputConfig?;
    private structureStrings;
    shouldMount(): boolean;
    validateConfiguration(): boolean;
    isValidDropzone(e: DragEvent): boolean;
    onHover(e: DragEvent): void;
    onDragStart(e: DragEvent): void;
    getDragType(): string | undefined;
    getDraggingBoxShadow(e: DragEvent): string;
    getDragPosition(e: DragEvent): "before" | "after";
    dispatchArrayMove(fromIndex: number, toIndex: number, fromSlug?: string): void;
    dispatchArrayRemove(fromIndex: number, source?: string): void;
    dispatchArrayAdd(newIndex: number, value: unknown, sourceIndex?: number): void;
    update(): Promise<void>;
    updateControls(): void;
    mount(): void;
    setupListeners(): void;
}
//# sourceMappingURL=editable-array-item.d.ts.map