import { hasEditable } from "../helpers/checks";
import { CloudCannon } from "../helpers/cloudcannon";
import { loadingPromise } from "../helpers/loading";
export default class Editable {
    constructor(element) {
        this.APIListeners = [];
        this.listeners = [];
        this.domListeners = [];
        this.value = undefined;
        this.parent = null;
        this.mounted = false;
        this.connected = false;
        this.disconnecting = false;
        this.needsReconnect = false;
        this.props = {};
        this.contexts = {};
        this.element = element;
        element.editable = this;
    }
    async lookupPath(path, obj) {
        if (!path) {
            return obj;
        }
        return path.split(".").reduce(async (acc, key) => {
            acc = await acc;
            if (CloudCannon.isAPICollection(acc)) {
                acc = await acc.items();
            }
            else if (CloudCannon.isAPIFile(acc)) {
                if (key === "@content") {
                    return acc.content.get();
                }
                acc = await acc.data.get();
            }
            else if (CloudCannon.isAPIDataset(acc)) {
                const items = await acc.items();
                if (Array.isArray(items)) {
                    acc = items;
                }
                else {
                    acc = await items.data.get();
                }
            }
            if (acc && typeof acc === "object" && key in acc) {
                return acc[key];
            }
        }, obj);
    }
    async lookupPathAndContext(path, obj, contexts = {}) {
        if (!path) {
            return {
                value: obj,
                context: {},
            };
        }
        let value = obj;
        let context;
        for (const key of path.split(".")) {
            if (!context && contexts[key]) {
                context = {
                    ...contexts[key],
                };
            }
            else {
                context = context ?? {
                    ...contexts.__base_context,
                };
            }
            if (CloudCannon.isAPICollection(value)) {
                context.collection = value;
                value = await value.items();
            }
            else if (CloudCannon.isAPIFile(value)) {
                context.file = value;
                if (key !== "@content") {
                    value = await value.data.get();
                }
            }
            else if (CloudCannon.isAPIDataset(value)) {
                context.dataset = value;
                const items = await value.items();
                if (Array.isArray(items)) {
                    value = items;
                }
                else {
                    context.file = items;
                    value = await items.data.get();
                }
            }
            if (key === "@content" && CloudCannon.isAPIFile(value)) {
                context.isContent = true;
                value = await value.content.get();
            }
            else if (value && typeof value === "object" && key in value) {
                value = value[key];
            }
            else {
                value = undefined;
            }
            context.fullPath = context.fullPath ? `${context.fullPath}.${key}` : key;
            if (context.file) {
                context.filePath = context.filePath
                    ? `${context.filePath}.${key}`
                    : key;
            }
        }
        return { value, context: context ?? {} };
    }
    shouldUpdate(_value) {
        return true;
    }
    shouldMount() {
        return this.value !== undefined;
    }
    async getNewValue(value, listener, contexts) {
        const { key, path } = listener ?? {};
        const { value: resolvedValue, context: newContext } = path
            ? await this.lookupPathAndContext(path, value, contexts)
            : { value, context: {} };
        if (!key) {
            this.propsBase = resolvedValue;
            this.contextBase = newContext;
        }
        else {
            this.props[key] = resolvedValue;
            this.contexts[key] = newContext;
        }
        if (Object.entries(this.props).length === 0) {
            return this.validateValue(this.propsBase);
        }
        const newValue = Object.entries(this.props).reduce((acc, [key, val]) => {
            acc[key] = structuredClone(val);
            return acc;
        }, structuredClone(this.propsBase ?? {}));
        return this.validateValue(newValue);
    }
    async pushValue(value, listener, contexts) {
        const newValue = await this.getNewValue(value, listener, contexts);
        if (typeof newValue === "undefined" || !this.shouldUpdate(newValue)) {
            return;
        }
        this.value = newValue;
        if (this.connected && !this.mounted) {
            this.mounted = true;
            this.mount();
            return this.update();
        }
        if (this.mounted) {
            return this.update();
        }
    }
    update() {
        this.listeners.forEach((listener) => listener.editable.pushValue(this.value, listener, {
            ...this.contexts,
            __base_context: this.contextBase ?? {},
        }));
    }
    validateValue(value) {
        return value;
    }
    registerListener(listener) {
        if (this.value !== undefined) {
            listener.editable.pushValue(this.value, listener, {
                ...this.contexts,
                __base_context: this.contextBase ?? {},
            });
        }
        if (this.listeners.find(({ editable: other, key }) => listener.editable.element === other.element && listener.key === key)) {
            return;
        }
        this.listeners.push(listener);
    }
    deregisterListener(target) {
        this.listeners = this.listeners.filter(({ editable }) => editable.element !== target.element);
    }
    async disconnect() {
        if (this.disconnecting) {
            return;
        }
        this.disconnecting = true;
        if (this.connectPromise) {
            await this.connectPromise;
        }
        this.parent?.deregisterListener(this);
        this.parent = null;
        this.APIListeners.forEach(({ obj, fn }) => {
            obj.removeEventListener("change", fn);
            obj.removeEventListener("delete", fn);
        });
        this.APIListeners = [];
        this.domListeners.forEach(({ event, fn }) => {
            this.element.removeEventListener(event, fn);
        });
        this.domListeners = [];
        this.connected = false;
        this.connectPromise = undefined;
        this.disconnecting = false;
        if (this.needsReconnect) {
            this.needsReconnect = false;
            this.connect();
        }
    }
    connect() {
        if (!this.validateConfiguration()) {
            return;
        }
        if (this.disconnecting) {
            this.needsReconnect = true;
            return;
        }
        if (this.connectPromise) {
            return;
        }
        this.connectPromise = loadingPromise.then(() => {
            this.setupListeners();
            this.connected = true;
            if (!this.mounted && this.shouldMount()) {
                this.mounted = true;
                this.mount();
                this.update();
            }
        });
    }
    addEventListener(event, fn) {
        this.domListeners.push({ event, fn });
        this.element.addEventListener(event, fn);
    }
    setupListeners() {
        let parentEditable;
        let parent = this.element.parentElement;
        while (parent) {
            if (hasEditable(parent)) {
                parentEditable = parent.editable;
                break;
            }
            parent = parent.parentElement;
        }
        this.parent = parentEditable || null;
        Object.entries(this.element.dataset).forEach(([propName, propPath]) => {
            if (!propName.startsWith("prop") || typeof propPath !== "string") {
                return;
            }
            const { collection, file, dataset, source, absolute } = this.parseSource(propPath);
            const listener = {
                editable: this,
                key: propName === "prop" ? undefined : propName.substring(4).toLowerCase(),
                path: source,
            };
            if (!absolute && parentEditable) {
                parentEditable.registerListener(listener);
                return;
            }
            // Any single data path should only be able to refer to a single absolute API object
            const obj = collection || dataset || file;
            if (obj) {
                const handleAPIChange = () => {
                    this.pushValue(obj, listener);
                };
                this.APIListeners.push({
                    obj,
                    fn: handleAPIChange,
                });
                obj.addEventListener("change", handleAPIChange);
                obj.addEventListener("delete", handleAPIChange);
                handleAPIChange();
            }
        });
        this.addEventListener("cloudcannon-api", this.handleApiEvent.bind(this));
    }
    handleApiEvent(e) {
        if (e.target !== this.element) {
            if (!e.detail.source) {
                e.detail.source = this.element.dataset.prop;
            }
            else {
                const source = e.detail.source;
                const [part, ...rest] = source.split(".");
                const propKey = part.charAt(0).toUpperCase() + part.slice(1);
                const propPath = this.element.dataset[`prop${propKey}`];
                if (propPath) {
                    rest.unshift(propPath);
                    e.detail.source = rest.join(".");
                }
                else if (this.element.dataset.prop) {
                    e.detail.source = `${this.element.dataset.prop}.${source}`;
                }
            }
        }
        const { absolute } = this.parseSource(e.detail.source);
        if (!this.parent || absolute) {
            if (this.executeApiCall(e.detail)) {
                e.stopPropagation();
            }
        }
    }
    executeApiCall(options) {
        let { file, collection, source, dataset } = this.parseSource(options.source);
        let filePromise;
        if (!file) {
            if (collection && source) {
                const parts = source.split(".");
                const first = Number(parts.shift());
                filePromise = collection.items().then((items) => items[first]);
                source = parts.join(".");
            }
            else if (dataset) {
                filePromise = dataset.items().then((items) => {
                    if (Array.isArray(items) && source) {
                        const parts = source.split(".");
                        const first = Number(parts.shift());
                        source = parts.join(".");
                        return items[first];
                    }
                    if (CloudCannon.isAPIFile(items)) {
                        return items;
                    }
                });
            }
            else {
                filePromise = Promise.resolve(undefined);
            }
        }
        else {
            filePromise = Promise.resolve(file);
        }
        filePromise.then((file) => {
            if (typeof source !== "string") {
                if (options.action === "get-input-config") {
                    options.callback({
                        options: {
                            disable_reorder: true,
                            disable_remove: true,
                            disable_add: true,
                        },
                    });
                    return true;
                }
                throw new Error(`Failed to resolve source for API call: ${options.source}`);
            }
            switch (options.action) {
                case "edit":
                    file?.data.edit({ slug: source, position: options.position });
                    break;
                case "set":
                    if (source?.endsWith("@content")) {
                        file?.content.set(options.value);
                    }
                    else if (source) {
                        file?.data.set({ slug: source, value: options.value });
                    }
                    break;
                case "add-array-item":
                    file?.data.addArrayItem({
                        slug: source,
                        index: options.newIndex,
                        value: options.value,
                    });
                    break;
                case "remove-array-item":
                    file?.data.removeArrayItem({
                        slug: source,
                        index: options.fromIndex,
                    });
                    break;
                case "move-array-item":
                    file?.data.moveArrayItem({
                        fromSlug: options.fromSlug ?? source,
                        fromIndex: options.fromIndex,
                        toSlug: source,
                        toIndex: options.toIndex,
                    });
                    break;
                case "get-input-config":
                    file?.getInputConfig({ slug: source }).then(options.callback);
                    break;
            }
        });
        return true;
    }
    mount() { }
    validateConfiguration() {
        return true;
    }
    dispatchSet(source, value) {
        this.element.dispatchEvent(new CustomEvent("cloudcannon-api", {
            bubbles: true,
            detail: {
                action: "set",
                source,
                value,
            },
        }));
    }
    async dispatchGetInputConfig(source) {
        return new Promise((resolve) => {
            this.element.dispatchEvent(new CustomEvent("cloudcannon-api", {
                bubbles: true,
                detail: {
                    action: "get-input-config",
                    source,
                    callback: resolve,
                },
            }));
        });
    }
    parseSource(source) {
        let collection;
        let file;
        let dataset;
        let absolute = false;
        const collectionMatch = source?.match(/^@collections\[(?<key>[^\]]+)\](\.(?<rest>.+))?$/);
        if (collectionMatch?.groups) {
            const { key, rest } = collectionMatch.groups;
            collection = CloudCannon.collection(key);
            source = rest;
            absolute = true;
        }
        else {
            const fileMatch = source?.match(/^@file\[(?<path>[^\]]+)\]\.(?<rest>.+)$/);
            if (fileMatch?.groups) {
                const { path, rest } = fileMatch.groups;
                file = CloudCannon.file(path);
                source = rest;
                absolute = true;
            }
            else {
                const dataMatch = source?.match(/^@data\[(?<key>[^\]]+)\](\.(?<rest>.+))?$/);
                if (dataMatch?.groups) {
                    const { key, rest } = dataMatch.groups;
                    dataset = CloudCannon.dataset(key);
                    source = rest;
                    absolute = true;
                }
                else {
                    file = CloudCannon.currentFile();
                }
            }
        }
        const snippets = [];
        let snippetMatch = source?.match(/@snippet\[(?<id>[^\]]+)\]\.(?<rest>.+)$/);
        while (snippetMatch?.groups) {
            const { id, rest } = snippetMatch.groups;
            snippets.push(id);
            source = rest;
            snippetMatch = source.match(/@snippet\[(?<id>[^\]]+)\]\.(?<rest>.+)$/);
        }
        return {
            collection,
            file,
            source,
            absolute,
            snippets,
            dataset,
        };
    }
}
//# sourceMappingURL=editable.js.map