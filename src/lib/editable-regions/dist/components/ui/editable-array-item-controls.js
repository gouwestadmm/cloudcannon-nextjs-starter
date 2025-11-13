import EditableComponentControls from "./editable-component-controls";
export default class EditableArrayItemControls extends EditableComponentControls {
    constructor() {
        super(...arguments);
        this.arrayDirection = "column";
        this.moveBackwardText = "up";
        this.moveForwardText = "down";
        this._disableMoveForward = false;
        this._disableMoveBackward = false;
        this._disableRemove = false;
        this._disableReorder = false;
        this._disableAdd = false;
    }
    set disableMoveForward(value) {
        this._disableMoveForward = value;
        this.update();
    }
    set disableMoveBackward(value) {
        this._disableMoveBackward = value;
        this.update();
    }
    set disableRemove(value) {
        this._disableRemove = value;
        this.update();
    }
    set disableReorder(value) {
        this._disableReorder = value;
        this.update();
    }
    set disableAdd(value) {
        this._disableAdd = value;
        this.update();
    }
    update() {
        if (this.addButton) {
            this.addButton.disabled = this._disableAdd;
        }
        if (this.duplicateButton) {
            this.duplicateButton.disabled = this._disableAdd;
        }
        if (this.dragHandle) {
            this.dragHandle.draggable = !this._disableReorder;
            this.dragHandle.innerHTML = `<cc-icon name="${this.dragHandle.draggable ? "drag_indicator" : "more_vert"}"></cc-icon>`;
        }
        if (this.moveForwardButton) {
            this.moveForwardButton.disabled =
                this._disableMoveForward || this._disableReorder;
        }
        if (this.moveBackwardButton) {
            this.moveBackwardButton.disabled =
                this._disableMoveBackward || this._disableReorder;
        }
        if (this.deleteButton) {
            this.deleteButton.disabled = this._disableRemove;
        }
    }
    addContextMenuButton(icon, text, onClick) {
        const button = document.createElement("button");
        button.onclick = onClick;
        button.innerHTML = `<cc-icon name="${icon}"></cc-icon> ${text}`;
        const buttonContainer = document.createElement("li");
        buttonContainer.append(button);
        this.contextMenu?.append(buttonContainer);
        return button;
    }
    render(shadow) {
        super.render(shadow);
        this.dragHandle = document.createElement("button");
        this.dragHandle.onclick = (e) => {
            e.stopPropagation();
            if (this.contextMenu?.classList.contains("open")) {
                this.contextMenu?.classList.remove("open");
                this.removeAttribute("open");
            }
            else if (this.contextMenu && this.contextMenu.childElementCount > 0) {
                this.contextMenu?.classList.add("open");
                this.setAttribute("open", "true");
            }
        };
        this.dragHandle.ondragstart = () => {
            this.contextMenu?.classList.remove("open");
            this.removeAttribute("open");
        };
        this.buttonRow?.append(this.dragHandle);
        this.addButton = this.addContextMenuButton("add", "Add", (e) => {
            this.dispatchEvent(new CustomEvent("add", { detail: { originalEvent: e } }));
        });
        this.duplicateButton = this.addContextMenuButton("library_add", "Duplicate", () => {
            this.dispatchEvent(new CustomEvent("duplicate", { detail: this }));
        });
        const backwardIconName = this.moveBackwardText === "up" ? "north" : "west";
        this.moveBackwardButton = this.addContextMenuButton(backwardIconName, `Move ${this.moveBackwardText}`, () => {
            this.dispatchEvent(new CustomEvent("move-backward", { detail: this }));
        });
        const forwardIconName = this.moveForwardText === "down" ? "south" : "east";
        this.moveForwardButton = this.addContextMenuButton(forwardIconName, `Move ${this.moveForwardText}`, () => {
            this.dispatchEvent(new CustomEvent("move-forward", { detail: this }));
        });
        this.deleteButton = this.addContextMenuButton("delete", "Delete", () => {
            this.dispatchEvent(new CustomEvent("delete", { detail: this }));
        });
        this.update();
    }
}
customElements.define("editable-array-item-controls", EditableArrayItemControls);
//# sourceMappingURL=editable-array-item-controls.js.map