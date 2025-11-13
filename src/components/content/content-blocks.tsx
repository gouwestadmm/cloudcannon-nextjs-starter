"use client";

import { getComponent } from "@/lib/component-registry";

type BlockComponent = {
  type: string;
  section: {
    uuid?: string;
  };
  [key: string]: unknown;
};

type RenderBlockProps = {
  block: BlockComponent;
  index: number;
  [key: string]: unknown;
};

function RenderBlock({ block, index }: RenderBlockProps) {
  const TargetComponent = getComponent(block.type);
  const props = block;

  if (!TargetComponent) {
    return null;
  }

  return (
    <div
      data-component={block.type}
      data-editable="array-item"
      data-id={block.type}
    >
      <TargetComponent index={index} {...props} />
    </div>
  );
}

type BlocksProps = {
  content_blocks: BlockComponent[];
  [key: string]: unknown;
};

export function Blocks({ content_blocks }: BlocksProps) {
  return (
    <div data-editable="array" data-id-key="type" data-prop="content_blocks">
      {content_blocks.map((block, index) => (
        <RenderBlock
          block={block}
          index={index}
          key={block.section?.uuid || `block-${index}`}
        />
      ))}
    </div>
  );
}
