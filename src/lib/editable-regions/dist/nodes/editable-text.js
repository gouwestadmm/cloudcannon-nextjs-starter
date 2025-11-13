import { CloudCannon } from "../helpers/cloudcannon.js";
import Editable from "./editable.js";
export default class EditableText extends Editable {
    constructor() {
        super(...arguments);
        this.focused = false;
        this.focusIndex = 0;
    }
    validateConfiguration() {
        const prop = this.element.dataset.prop;
        if (typeof prop !== "string") {
            this.element.classList.add("errored");
            const error = document.createElement("editable-region-error-card");
            error.setAttribute("heading", "Failed to render text editable region");
            error.setAttribute("message", "Text editable regions require a 'data-prop' HTML attribute but none was provided. Please check that this element has a valid 'data-prop' attribute.");
            this.element.replaceChildren(error);
            return false;
        }
        const elementType = this.element.dataset.type;
        if (typeof elementType === "string" &&
            !["span", "text", "block"].includes(elementType)) {
            this.element.classList.add("errored");
            const error = document.createElement("editable-region-error-card");
            error.setAttribute("heading", "Failed to render text editable region");
            error.setAttribute("message", `Text editable region received an invalid type for the 'data-type' HTML attribute. The provided element type was '${elementType}' but the supported element types are 'span', 'text', and 'block'. Please set the 'data-type' attribute to one of the supported types.`);
            this.element.replaceChildren(error);
            return false;
        }
        return true;
    }
    validateValue(value) {
        if (typeof value !== "string" && value !== null) {
            this.element.classList.add("errored");
            const error = document.createElement("editable-region-error-card");
            error.setAttribute("heading", "Failed to render text editable region");
            error.setAttribute("message", `Text editable regions expect to receive a value of type "string" but instead received a value of type '${typeof value}'.`);
            if (this.contextBase?.fullPath) {
                error.setAttribute("hint", `This may mean that the 'data-prop' attribute is incorrectly set for this element, the full 'data-prop' path was '${this.contextBase?.fullPath}'.`);
            }
            else {
                error.setAttribute("hint", `This may mean that the 'data-prop' attribute is incorrectly set for this element.`);
            }
            this.element.replaceChildren(error);
            return;
        }
        return value;
    }
    shouldUpdate(value) {
        return (!this.focused &&
            value !== this.value &&
            (typeof value === "string" || value === null));
    }
    update() {
        this.editor?.setContent(this.value);
    }
    mount() {
        this.element.addEventListener("blur", () => {
            this.focused = false;
            this.element.dispatchEvent(new CustomEvent("editable:blur", {
                bubbles: true,
                detail: this.focusIndex,
            }));
        });
        this.element.addEventListener("focus", () => {
            this.focusIndex += 1;
            this.element.dispatchEvent(new CustomEvent("editable:focus", {
                bubbles: true,
                detail: this.focusIndex,
            }));
        });
        this.element.addEventListener("editable:focus", (e) => {
            this.focused = true;
            this.focusIndex = e.detail;
        });
        this.element.addEventListener("editable:blur", (e) => {
            if (e.detail >= this.focusIndex) {
                this.focused = false;
            }
        });
        if (typeof this.element.dataset.deferMount === "string") {
            this.element.onclick = () => {
                this.focused = true;
                this.mountEditor().then(() => {
                    this.element.focus();
                });
            };
            return;
        }
        if (!this.editor) {
            this.mountEditor();
        }
    }
    async mountEditor() {
        if (this.editor) {
            return this.editor;
        }
        const inputConfig = this.contextBase?.isContent
            ? { type: "markdown" }
            : await this.dispatchGetInputConfig(this.element.dataset.prop);
        this.editor = await CloudCannon.createTextEditableRegion(this.element, this.onChange.bind(this), {
            elementType: this.element.dataset.type,
            editableType: this.contextBase?.isContent ? "content" : undefined,
            inputConfig,
        });
        if (typeof this.value === "string") {
            this.update();
        }
        return this.editor;
    }
    onChange(value) {
        const source = this.element.dataset.prop;
        if (typeof source !== "string") {
            throw new Error("Source not found");
        }
        this.value = value;
        this.dispatchSet(source, value);
    }
}
//# sourceMappingURL=editable-text.js.map