import EditableArrayItem from "../nodes/editable-array-item.js";
import EditableText from "../nodes/editable-text.js";
import Editable from "../nodes/editable.js";
export declare const hasEditable: <T extends object>(el: T) => el is T & {
    editable: Editable;
};
export declare const hasEditableText: <T extends object>(el: T) => el is T & {
    editable: EditableText;
};
export declare const hasEditableArrayItem: <T extends object>(el: T) => el is T & {
    editable: EditableArrayItem;
};
export declare const isEditableWebcomponent: (el: unknown) => boolean;
export declare const isEditableElement: (el: unknown) => boolean;
export declare const areEqualEditables: (a: HTMLElement, b: HTMLElement) => boolean;
export declare const isEditableText: (el?: Element | null) => boolean;
export declare const isEditableArrayItem: (el?: Element | null) => boolean;
export declare const isEditableArray: (el?: Element | null) => boolean;
//# sourceMappingURL=checks.d.ts.map