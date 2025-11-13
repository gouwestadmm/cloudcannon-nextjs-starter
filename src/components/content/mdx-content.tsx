import { MDXContent } from "@content-collections/mdx/react";
import { components } from "@/components/content/mdx-components";

type MdxContentProps = {
  code?: string | null;
  content?: string;
  className?: string;
} & Record<string, unknown>;

export function MdxContent({ code, className, ...props }: MdxContentProps) {
  return (
    <div className={className} {...props}>
      {code && <MDXContent code={code} components={components} />}
    </div>
  );
}
