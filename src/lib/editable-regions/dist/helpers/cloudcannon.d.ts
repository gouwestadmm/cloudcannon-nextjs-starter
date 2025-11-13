import type { CloudCannonJavaScriptV1API } from "@cloudcannon/javascript-api";
export type ComponentRenderer = (props: any) => HTMLElement | Promise<HTMLElement>;
declare let _cloudcannon: CloudCannonJavaScriptV1API;
export declare const apiLoadedPromise: Promise<void>;
export declare const addEditableComponentRenderer: (key: string, renderer: ComponentRenderer) => void;
export declare const addEditableSnippetRenderer: (key: string, renderer: ComponentRenderer) => void;
export declare const getEditableComponentRenderers: () => Record<string, ComponentRenderer>;
export declare const getEditableSnippetRenderers: () => Record<string, ComponentRenderer>;
export declare const realizeAPIValue: (value: unknown) => Promise<unknown>;
export { _cloudcannon as CloudCannon };
//# sourceMappingURL=cloudcannon.d.ts.map