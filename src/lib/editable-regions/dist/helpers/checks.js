import EditableArrayItem from "../nodes/editable-array-item.js";
import EditableText from "../nodes/editable-text.js";
import Editable from "../nodes/editable.js";
const TAG_NAMES = [
    "EDITABLE-TEXT",
    "EDITABLE-COMPONENT",
    "EDITABLE-ARRAY-ITEM",
    "EDITABLE-ARRAY",
    "EDITABLE-IMAGE",
    "EDITABLE-SOURCE",
    "EDITABLE-SNIPPET",
];
const EDITABLE_REGION_TYPES = [
    "text",
    "component",
    "array",
    "array-item",
    "image",
    "source",
];
const CORRESPONDING_NAME = {
    "EDITABLE-TEXT": "text",
    "EDITABLE-COMPONENT": "component",
    "EDITABLE-ARRAY-ITEM": "array-item",
    "EDITABLE-ARRAY": "array",
    "EDITABLE-IMAGE": "image",
    "EDITABLE-SOURCE": "source",
};
export const hasEditable = (el) => {
    return "editable" in el && el.editable instanceof Editable;
};
export const hasEditableText = (el) => {
    return "editable" in el && el.editable instanceof EditableText;
};
export const hasEditableArrayItem = (el) => {
    return "editable" in el && el.editable instanceof EditableArrayItem;
};
export const isEditableWebcomponent = (el) => {
    if (!(el instanceof HTMLElement)) {
        return false;
    }
    return TAG_NAMES.includes(el.tagName);
};
export const isEditableElement = (el) => {
    if (!(el instanceof HTMLElement)) {
        return false;
    }
    return (TAG_NAMES.includes(el.tagName) ||
        (!!el.dataset.editable &&
            EDITABLE_REGION_TYPES.includes(el.dataset.editable)));
};
export const areEqualEditables = (a, b) => {
    if (a.tagName !== b.tagName &&
        a.dataset.editable !== b.dataset.editable &&
        CORRESPONDING_NAME[a.tagName] !== b.dataset.editable &&
        CORRESPONDING_NAME[b.tagName] !== a.dataset.editable) {
        return false;
    }
    if (Object.keys(a.dataset).length !== Object.keys(b.dataset).length) {
        return false;
    }
    return Object.keys(a.dataset).every((key) => a.dataset[key] === b.dataset[key]);
};
export const isEditableText = (el) => {
    return (el?.tagName === "EDITABLE-TEXT" ||
        (el instanceof HTMLElement && el.dataset.editable === "text"));
};
export const isEditableArrayItem = (el) => {
    return (el?.tagName === "EDITABLE-ARRAY-ITEM" ||
        (el instanceof HTMLElement && el.dataset.editable === "array-item"));
};
export const isEditableArray = (el) => {
    return (el?.tagName === "EDITABLE-ARRAY" ||
        (el instanceof HTMLElement && el.dataset.editable === "array"));
};
//# sourceMappingURL=checks.js.map