import Editable from "./editable.js";
import "../components/ui/editable-region-error-card.js";
import "../components/ui/editable-component-controls.js";
import type EditableComponentControls from "../components/ui/editable-component-controls.js";
export default class EditableComponent extends Editable {
    protected controlsElement?: EditableComponentControls;
    private updatePromise;
    private needsReupdate;
    getComponents(): Record<string, import("../helpers/cloudcannon.js").ComponentRenderer>;
    shouldMount(): boolean;
    validateConfiguration(): boolean;
    update(): Promise<void>;
    _update(): Promise<void>;
    updateTree(targetNode?: ChildNode | null, renderNode?: ChildNode | null): void;
    updateNode(targetChild: ChildNode, renderChild: ChildNode): void;
    updateEditable(renderChild: HTMLElement, targetChild: HTMLElement & {
        editable: Editable;
    }): void;
    dispatchEdit(source?: string, originalEvent?: MouseEvent): void;
    setupListeners(): void;
    mount(): void;
}
//# sourceMappingURL=editable-component.d.ts.map