import { areEqualEditables, hasEditable, hasEditableText, isEditableElement, isEditableText, } from "../helpers/checks.js";
import Editable from "./editable.js";
import "../components/ui/editable-region-error-card.js";
import "../components/ui/editable-component-controls.js";
import { getEditableComponentRenderers, realizeAPIValue, } from "../helpers/cloudcannon.js";
export default class EditableComponent extends Editable {
    constructor() {
        super(...arguments);
        this.needsReupdate = false;
    }
    getComponents() {
        return getEditableComponentRenderers();
    }
    shouldMount() {
        if (super.shouldMount()) {
            return true;
        }
        return !Object.keys(this.element.dataset).some((key) => key.startsWith("prop"));
    }
    validateConfiguration() {
        const key = this.element.dataset.component;
        if (!key) {
            this.element.classList.add("errored");
            const error = document.createElement("editable-region-error-card");
            error.setAttribute("heading", "Failed to render component");
            error.setAttribute("message", "Component editable regions require a 'data-component' HTML attribute but none was provided. Please check that this element has a valid 'data-component' attribute.");
            this.element.replaceChildren(error);
            return false;
        }
        return true;
    }
    update() {
        if (this.updatePromise) {
            this.needsReupdate = true;
            return this.updatePromise;
        }
        this.updatePromise = this._update().then(() => {
            this.updatePromise = undefined;
            if (this.needsReupdate) {
                this.needsReupdate = false;
                return this.update();
            }
        });
        return this.updatePromise;
    }
    async _update() {
        this.element.classList.remove("errored");
        const key = this.element.dataset.component;
        if (!key) {
            return super.update();
        }
        const component = this.getComponents()?.[key];
        if (!component) {
            return super.update();
        }
        const value = await realizeAPIValue(this.value);
        if (value && typeof value === "object" && !Array.isArray(value)) {
            for (const key of Object.keys(value)) {
                value[key] = await realizeAPIValue(value[key]);
            }
        }
        let rootEl;
        try {
            rootEl = await component(this.value);
        }
        catch (err) {
            this.element.classList.add("errored");
            const error = document.createElement("editable-region-error-card");
            error.setAttribute("heading", `Failed to render component: ${key}`);
            error.error = err;
            this.element.replaceChildren(error);
            return;
        }
        const child = rootEl.firstElementChild;
        if (child instanceof HTMLElement &&
            "editable" in child &&
            child.editable instanceof EditableComponent &&
            child.dataset.component === key) {
            rootEl = child;
        }
        if (this.controlsElement) {
            this.controlsElement.remove();
        }
        this.updateTree(this.element, rootEl);
        if (this.controlsElement) {
            this.element.appendChild(this.controlsElement);
        }
    }
    updateTree(targetNode, renderNode) {
        let targetChild = targetNode?.firstChild ?? undefined;
        let renderChild = renderNode?.firstChild ?? undefined;
        while (renderChild || targetChild) {
            const nextTargetChild = targetChild?.nextSibling ?? undefined;
            const nextRenderChild = renderChild?.nextSibling ?? undefined;
            if (targetChild instanceof Element &&
                renderChild &&
                !(renderChild instanceof Element)) {
                targetChild.before(renderChild);
                renderChild = nextRenderChild;
                continue;
            }
            if (renderChild instanceof Element &&
                targetChild &&
                !(targetChild instanceof Element)) {
                targetChild.remove();
                targetChild = nextTargetChild;
                continue;
            }
            if (renderChild &&
                targetChild &&
                !(renderChild instanceof Element) &&
                !(targetChild instanceof Element)) {
                targetChild.nodeValue = renderChild.nodeValue;
            }
            else if (targetChild instanceof HTMLElement &&
                renderChild instanceof HTMLElement &&
                isEditableElement(renderChild) &&
                isEditableElement(targetChild)) {
                if (!areEqualEditables(renderChild, targetChild)) {
                    targetChild.replaceWith(renderChild);
                }
                else if (isEditableText(renderChild) && isEditableText(targetChild)) {
                    if (hasEditableText(targetChild) &&
                        !targetChild.editable.focused &&
                        !targetChild?.isEqualNode(renderChild) &&
                        hasEditable(renderChild)) {
                        targetChild.replaceWith(renderChild);
                        for (let i = 0; i < this.listeners.length; i++) {
                            const listener = this.listeners[i];
                            if (listener.editable.element === targetChild) {
                                listener.editable.element = renderChild;
                                renderChild.editable.pushValue(this.value, listener, {
                                    ...this.contexts,
                                    __base_context: this.contextBase ?? {},
                                });
                            }
                        }
                    }
                    else if (hasEditable(targetChild)) {
                        this.updateEditable(renderChild, targetChild);
                    }
                }
                else if (hasEditable(targetChild)) {
                    this.updateEditable(renderChild, targetChild);
                }
            }
            else if (renderChild && targetChild) {
                if (renderChild.nodeName !== targetChild.nodeName ||
                    isEditableElement(renderChild) ||
                    isEditableElement(targetChild)) {
                    targetChild.replaceWith(renderChild);
                }
                else {
                    this.updateNode(targetChild, renderChild);
                    this.updateTree(targetChild, renderChild);
                }
            }
            else if (renderChild) {
                targetNode?.appendChild(renderChild);
            }
            else if (targetChild) {
                targetNode?.removeChild(targetChild);
            }
            targetChild = nextTargetChild;
            renderChild = nextRenderChild;
        }
    }
    updateNode(targetChild, renderChild) {
        if (targetChild instanceof Element && renderChild instanceof Element) {
            for (const attribute of renderChild.attributes) {
                targetChild.setAttribute(attribute.name, attribute.value);
            }
            for (const attribute of targetChild.attributes) {
                if (!renderChild.hasAttribute(attribute.name)) {
                    targetChild.removeAttribute(attribute.name);
                }
            }
        }
    }
    updateEditable(renderChild, targetChild) {
        for (const attribute of renderChild.attributes) {
            if (attribute.name !== "class") {
                targetChild.setAttribute(attribute.name, attribute.value);
            }
        }
        for (const attribute of targetChild.attributes) {
            if (!renderChild.hasAttribute(attribute.name) &&
                attribute.name !== "class" &&
                attribute.name !== "contenteditable") {
                targetChild.removeAttribute(attribute.name);
            }
        }
        for (const className of renderChild.classList) {
            targetChild.classList.add(className);
        }
        for (const className of targetChild.classList) {
            if (!renderChild.classList.contains(className) &&
                !className.includes("ProseMirror")) {
                targetChild.classList.remove(className);
            }
        }
        for (let i = 0; i < this.listeners.length; i++) {
            const listener = this.listeners[i];
            if (listener.editable.element === targetChild) {
                targetChild.editable.pushValue(this.value, listener, {
                    ...this.contexts,
                    __base_context: this.contextBase ?? {},
                });
            }
        }
    }
    dispatchEdit(source, originalEvent) {
        const rect = this.element.getBoundingClientRect();
        this.element.dispatchEvent(new CustomEvent("cloudcannon-api", {
            bubbles: true,
            detail: {
                action: "edit",
                source,
                position: {
                    x: originalEvent?.clientX ?? 0,
                    y: originalEvent?.clientY ?? 0,
                    left: rect.left,
                    width: rect.width,
                    top: rect.top,
                    height: rect.height,
                },
            },
        }));
    }
    setupListeners() {
        super.setupListeners();
        const key = this.element.dataset.component;
        if (!key) {
            return;
        }
        const component = this.getComponents()?.[key];
        if (!component) {
            document.addEventListener(`editable-regions:registered-${key}`, () => this.update(), { once: true });
        }
    }
    mount() {
        if (!this.controlsElement) {
            let editPath;
            Object.entries(this.element.dataset).forEach(([propName, propPath]) => {
                if (!propName.startsWith("prop")) {
                    return;
                }
                if (typeof editPath !== "string") {
                    editPath = propPath;
                    return;
                }
                while (!propPath?.startsWith(editPath)) {
                    editPath = editPath?.replace(/(\.|^)[^.]*$/, "");
                }
            });
            editPath || (editPath = this.element.dataset.prop);
            editPath || (editPath = Object.entries(this.element.dataset).find(([propName]) => propName.startsWith("prop"))?.[1]);
            if (editPath) {
                this.controlsElement = document.createElement("editable-component-controls");
                this.controlsElement.addEventListener("edit", (e) => {
                    this.dispatchEdit(editPath);
                });
                this.element.append(this.controlsElement);
            }
            this.update();
        }
    }
}
//# sourceMappingURL=editable-component.js.map