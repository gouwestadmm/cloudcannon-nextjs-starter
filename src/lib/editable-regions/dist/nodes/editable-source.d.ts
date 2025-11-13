import type { CloudCannonJavaScriptV1APIFile } from "@cloudcannon/javascript-api";
import EditableText from "./editable-text.js";
export default class EditableSource extends EditableText {
    file?: CloudCannonJavaScriptV1APIFile;
    format: {
        leading: string;
        trailing: string;
        indent: string;
        indentSize: number;
        indentChar: string;
    };
    setupListeners(): void;
    validateConfiguration(): boolean;
    validateValue(value: unknown): string | null | undefined;
    getSourceIndices(source: string): {
        start: number;
        end: number;
    };
    update(): void;
    mountEditor(): Promise<any>;
    onChange(value?: string | null): void;
}
//# sourceMappingURL=editable-source.d.ts.map