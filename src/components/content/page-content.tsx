import { Blocks } from "@/components/content/content-blocks";
import type { BlockComponent } from "@/types/block-component";

type PageContentProps = {
  content: {
    content_blocks: BlockComponent[];
  };
};

export function PageContent({ content }: PageContentProps) {
    return (<Blocks content_blocks={content.content_blocks} />);
}
