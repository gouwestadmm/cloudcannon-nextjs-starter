let _cloudcannon;
export const apiLoadedPromise = new Promise((resolve) => {
    if (window.CloudCannonAPI) {
        _cloudcannon = window.CloudCannonAPI.useVersion("v1", true);
        resolve();
    }
    else {
        document.addEventListener("cloudcannon:load", () => {
            if (window.CloudCannonAPI) {
                _cloudcannon = window.CloudCannonAPI.useVersion("v1", true);
            }
            return resolve();
        }, { once: true });
    }
});
export const addEditableComponentRenderer = (key, renderer) => {
    window.cc_components = window.cc_components || {};
    window.cc_components[key] = renderer;
    document.dispatchEvent(new CustomEvent(`editable-regions:registered-${key}`));
};
export const addEditableSnippetRenderer = (key, renderer) => {
    window.cc_snippets = window.cc_snippets || {};
    window.cc_snippets[key] = renderer;
    document.dispatchEvent(new CustomEvent(`editable-regions:registered-${key}`));
};
export const getEditableComponentRenderers = () => window.cc_components ?? {};
export const getEditableSnippetRenderers = () => window.cc_snippets ?? {};
export const realizeAPIValue = async (value) => {
    if (_cloudcannon.isAPICollection(value)) {
        const items = await value.items();
        return Promise.all(items.map(realizeAPIValue));
    }
    if (_cloudcannon.isAPIFile(value)) {
        return value.data.get();
    }
    if (_cloudcannon.isAPIDataset(value)) {
        const items = await value.items();
        if (Array.isArray(items)) {
            return Promise.all(items.map(realizeAPIValue));
        }
        return items.data.get();
    }
    return value;
};
export { _cloudcannon as CloudCannon };
//# sourceMappingURL=cloudcannon.js.map