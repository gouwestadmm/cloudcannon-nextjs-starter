"use client";

import { getComponent } from "@/lib/component-registry";

type BlockComponent = {
  _type: string;
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
  const TargetComponent = getComponent(block._type);
  const props = block;

  if (!TargetComponent) {
    return null;
  }

  return (
    <div
      data-component={block._type}
      data-editable="array-item"
      data-id={block._type}
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
    <div data-editable="array" data-id-key="_type" data-prop="content_blocks">
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
