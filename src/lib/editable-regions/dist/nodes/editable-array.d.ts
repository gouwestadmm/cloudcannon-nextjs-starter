import type { CloudCannonJavaScriptV1APICollection, CloudCannonJavaScriptV1APIDataset } from "@cloudcannon/javascript-api";
import Editable, { type EditableListener } from "./editable.js";
import "../components/ui/editable-region-button.js";
declare const arrayDirectionValues: readonly ["row", "column", "row-reverse", "column-reverse"];
export type ArrayDirection = (typeof arrayDirectionValues)[number];
export default class EditableArray extends Editable {
    arrayDirection?: ArrayDirection;
    value: CloudCannonJavaScriptV1APICollection | CloudCannonJavaScriptV1APIDataset | unknown[] | null | undefined;
    private updatePromise;
    private needsReupdate;
    private addButton?;
    registerListener(listener: EditableListener): Promise<void>;
    deregisterListener(_target: Editable): void;
    validateConfiguration(): boolean;
    validateValue(value: unknown): this["value"];
    update(): Promise<void>;
    private _update;
    calculateArrayDirection(): ArrayDirection;
    mount(): void;
}
export {};
//# sourceMappingURL=editable-array.d.ts.map