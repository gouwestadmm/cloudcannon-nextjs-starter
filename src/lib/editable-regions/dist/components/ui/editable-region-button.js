import styleContent from "../../styles/ui/editable-region-button.css?inline";
export default class EditableRegionButton extends HTMLElement {
    connectedCallback() {
        if (this.shadow) {
            return;
        }
        this.shadow = this.attachShadow({ mode: "open" });
        this.render(this.shadow);
    }
    render(shadow) {
        const style = document.createElement("style");
        style.textContent = styleContent;
        shadow.appendChild(style);
        const button = document.createElement("button");
        button.innerHTML = `<cc-icon name='${this.getAttribute("icon")}'></cc-icon>${this.getAttribute("text")}`;
        shadow.appendChild(button);
        button.addEventListener("click", (e) => {
            this.dispatchEvent(new CustomEvent("button-click", { detail: { originalEvent: e } }));
        });
    }
}
customElements.define("editable-region-button", EditableRegionButton);
//# sourceMappingURL=editable-region-button.js.map