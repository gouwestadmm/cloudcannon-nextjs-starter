import Editable from "./editable.js";
export default class EditableImage extends Editable {
    value: {
        src?: string;
        alt?: string;
        title?: string;
    } | null | undefined;
    inputConfig: {
        src?: any;
        alt?: any;
        title?: any;
    };
    imageEl?: HTMLImageElement;
    configuredSrc: boolean;
    configuredAlt: boolean;
    configuredTitle: boolean;
    displayError(heading: string, message: string, hint?: string): void;
    validateConfiguration(): boolean;
    validateValue(value: unknown): this["value"];
    update(): Promise<void>;
    loadInputConfig(): Promise<void>;
    mount(): void;
}
//# sourceMappingURL=editable-image.d.ts.map