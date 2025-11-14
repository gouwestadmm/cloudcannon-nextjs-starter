import { visit } from "unist-util-visit";

/**
 * Remark plugin to transform HTML elements to custom React components
 * by capitalizing the first letter of the tag name
 */
export default function remarkHtmlToComponents() {
  return (tree) => {
    // Handle MDX JSX Flow Elements (already parsed as JSX)
    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name) {
        node.name = node.name.charAt(0).toUpperCase() + node.name.slice(1);
      }
    });

    // Handle raw HTML nodes in markdown
    visit(tree, "html", (node) => {
      if (node.value) {
        // Replace HTML tags with capitalized versions
        node.value = node.value.replace(
          /<(\/?)(img|div|iframe|video|audio|section|article|header|footer|nav|aside|main)(\s|>)/gi,
          (_match, slash, tag, after) => {
            const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
            return `<${slash}${capitalizedTag}${after}`;
          }
        );
      }
    });
    return tree;
  };
}
