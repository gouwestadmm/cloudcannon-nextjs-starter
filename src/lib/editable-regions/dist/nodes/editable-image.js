import { CloudCannon } from "../helpers/cloudcannon.js";
import Editable from "./editable.js";
export default class EditableImage extends Editable {
    constructor() {
        super(...arguments);
        this.value = undefined;
        this.inputConfig = {};
        this.configuredSrc = false;
        this.configuredAlt = false;
        this.configuredTitle = false;
    }
    displayError(heading, message, hint) {
        this.element.classList.add("errored");
        const error = document.createElement("editable-region-error-card");
        error.setAttribute("heading", heading);
        error.setAttribute("message", message);
        if (hint) {
            error.setAttribute("hint", hint);
        }
        if (this.imageEl) {
            this.imageEl?.replaceWith(error);
        }
        else {
            this.element.replaceChildren(error);
        }
    }
    validateConfiguration() {
        const child = this.element instanceof HTMLImageElement
            ? this.element
            : this.element.querySelector("img");
        if (!(child instanceof HTMLImageElement)) {
            this.displayError("Failed to render image editable region", "Image editable regions must contain a child HTML element of type 'img'. Please check that this element has a child 'img' element.");
            return false;
        }
        this.imageEl = child;
        if (this.element.dataset.prop === undefined &&
            this.element.dataset.propSrc === undefined &&
            this.element.dataset.propAlt === undefined &&
            this.element.dataset.propTitle === undefined) {
            this.displayError("Failed to render image editable region", "Image editable regions require atleast one valid 'data-prop-*' HTML attribute. The valid attributes are 'data-prop', 'data-prop-src', 'data-prop-alt', and 'data-prop-title'. Please check that this element has atleast one of these attributes.");
            return false;
        }
        return true;
    }
    validateValue(value) {
        if (typeof value !== "object") {
            this.displayError("Failed to render image editable region", `Image editable regions expect to receive a value of type "object" but instead received a value of type '${typeof value}'.`, this.contextBase?.fullPath
                ? `This may mean that the 'data-prop' attribute is incorrectly set for this element, the full 'data-prop' path was '${this.contextBase?.fullPath}'.`
                : `This may mean that the 'data-prop' attribute is incorrectly set for this element.`);
            return;
        }
        if (value === null) {
            return value;
        }
        for (const key of ["src", "alt", "title"]) {
            if (key in value &&
                typeof value[key] !== "string" &&
                value[key] !== null) {
                let hint;
                if (this.contexts[key]?.fullPath) {
                    hint = `This may mean that the 'data-prop-${key}' attribute is incorrectly set for this element, the full 'data-prop-${key}' path was '${this.contexts[key]?.fullPath}'.`;
                }
                else if (typeof this.element.dataset[key] === "string") {
                    hint = `This may mean that the 'data-prop-${key}' attribute is incorrectly set for this element.`;
                }
                else if (this.contextBase?.fullPath) {
                    hint = `This may mean that the 'data-prop' attribute is incorrectly set for this element, the full 'data-prop' path was '${this.contextBase?.fullPath}'.`;
                }
                else {
                    hint = `This may mean that the 'data-prop' attribute is incorrectly set for this element.`;
                }
                this.displayError("Failed to render image editable region", `Image editable regions expect the "${key}" key to have a value of type "string" but instead it was a value of type '${typeof value[key]}'.`, hint);
                return;
            }
        }
        const unexpectedKey = Object.keys(value).find((key) => key !== "src" && key !== "alt" && key !== "title");
        if (unexpectedKey) {
            let hint;
            const capitalizedUnexpectedKey = unexpectedKey.charAt(0).toUpperCase() + unexpectedKey.slice(1);
            if (this.element.dataset[`prop${capitalizedUnexpectedKey}`]) {
                hint = `Try removing the 'data-prop-${unexpectedKey}' HTML attribute from this element.`;
            }
            else if (this.contextBase?.fullPath) {
                hint = `This may mean that the 'data-prop' attribute is incorrectly set for this element, the full 'data-prop' path was '${this.contextBase?.fullPath}'.`;
            }
            else {
                hint = `This may mean that the 'data-prop' attribute is incorrectly set for this element.`;
            }
            this.displayError("Failed to render image editable region", `Image editable region received an unexpected value key "${unexpectedKey}". The supported values are "src", "alt", and "title". Please check that your data is correctly formatted.`, hint);
            return;
        }
        return value;
    }
    async update() {
        if (!this.imageEl) {
            throw new Error("Element is not an HTMLImageElement");
        }
        if (this.configuredSrc && this.imageEl.src !== this.value?.src) {
            const previewUrl = await CloudCannon.getPreviewUrl(this.value?.src ?? "", this.inputConfig.src);
            this.imageEl.src = previewUrl;
            const parent = this.imageEl.parentElement;
            if (parent instanceof HTMLPictureElement) {
                for (const sourceEl of parent.children) {
                    if (sourceEl instanceof HTMLSourceElement) {
                        sourceEl.src = previewUrl;
                        sourceEl.srcset = previewUrl;
                    }
                }
            }
        }
        if (this.configuredAlt && this.imageEl.alt !== this.value?.alt) {
            this.imageEl.alt = this.value?.alt ?? "";
        }
        if (this.configuredTitle && this.imageEl.title !== this.value?.title) {
            this.imageEl.title = this.value?.title ?? "";
        }
    }
    async loadInputConfig() {
        this.inputConfig = {};
        if (this.configuredSrc) {
            this.inputConfig.src = await this.dispatchGetInputConfig(this.element.dataset.propSrc ?? `${this.element.dataset.prop}.src`);
        }
        if (this.configuredAlt) {
            this.inputConfig.alt = await this.dispatchGetInputConfig(this.element.dataset.propAlt ?? `${this.element.dataset.prop}.alt`);
        }
        if (this.configuredTitle) {
            this.inputConfig.title = await this.dispatchGetInputConfig(this.element.dataset.propTitle ?? `${this.element.dataset.prop}.title`);
        }
    }
    mount() {
        this.configuredSrc =
            !!this.element.dataset.propSrc || !!this.element.dataset.prop;
        this.configuredAlt =
            !!this.element.dataset.propAlt || !!this.element.dataset.prop;
        this.configuredTitle =
            !!this.element.dataset.propTitle || !!this.element.dataset.prop;
        this.loadInputConfig().then(() => {
            this.imageEl?.addEventListener("click", () => {
                if (!this.value) {
                    throw new Error("Value is not defined");
                }
                const data = {};
                if ("src" in this.value) {
                    data.src = this.value.src;
                }
                if ("alt" in this.value) {
                    data.alt = this.value.alt;
                }
                if ("title" in this.value) {
                    data.title = this.value.title;
                }
                CloudCannon.createCustomDataPanel({
                    title: "Edit Image",
                    data,
                    position: this.imageEl?.getBoundingClientRect(),
                    config: {
                        _inputs: {
                            src: {
                                label: "Image",
                                type: "image",
                                ...this.inputConfig.src,
                            },
                            alt: {
                                comment: "A description which provides information about this image if for some reason it cannot be viewed.",
                                ...this.inputConfig.alt,
                            },
                            title: {
                                comment: "Displayed when hovering over the image.",
                                ...this.inputConfig.title,
                            },
                        },
                    },
                    onChange: (value) => {
                        if (!value || typeof value !== "object") {
                            throw new Error("Invalid image data");
                        }
                        if ("src" in value &&
                            this.configuredSrc &&
                            value.src !== this.value?.src) {
                            this.dispatchSet(this.element.dataset.propSrc ??
                                `${this.element.dataset.prop}.src`, value.src);
                        }
                        if ("alt" in value &&
                            this.configuredAlt &&
                            value.alt !== this.value?.alt) {
                            this.dispatchSet(this.element.dataset.propAlt ??
                                `${this.element.dataset.prop}.alt`, value.alt);
                        }
                        if ("title" in value &&
                            this.configuredTitle &&
                            value.title !== this.value?.title) {
                            this.dispatchSet(this.element.dataset.propTitle ??
                                `${this.element.dataset.prop}.title`, value.title);
                        }
                    },
                });
            });
        });
    }
}
//# sourceMappingURL=editable-image.js.map