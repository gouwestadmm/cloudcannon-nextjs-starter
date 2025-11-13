import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
} from "@/components/core/typography/typography";
import { cn } from "@/lib/utils";

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="overflow-auto rounded-md bg-gray-100 p-4">
    <code className="font-mono text-gray-800 text-sm">{children}</code>
  </pre>
);

export const components = {
  h1: ({ node, ...props }) => <H1 className="mx-auto max-w-2xl" {...props} />,
  h2: ({ node, ...props }) => <H2 className="mx-auto max-w-2xl" {...props} />,
  h3: ({ node, ...props }) => (
    <H3 className="*))]:max-w-2xl *)]:max-w-4xl text-balance [&:not(:where(blockquote [&:where(blockquote lg:col-start-5 lg:col-end-13">
      {props.children}
    </H3>
  ),
  h4: ({ node, ...props }) => <H4 className="">{props.children}</H4>,
  h5: ({ node, ...props }) => <H5 className="">{props.children}</H5>,
  h6: ({ node, ...props }) => <H6 className="">{props.children}</H6>,
  p: ({ node, ...props }) => <P className="">{props.children}</P>,
  a: ({ className, ...props }) => (
    <a
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  Image: ({ className, ...props }) => (
    <div className="lg:col-start-3 lg:col-end-13">
      <Image
        alt={props.alt || ""}
        className="my-6 rounded-3xl lg:my-12"
        height={props.height}
        image={props.src}
        width={props.width}
        {...props}
      />
    </div>
  ),
  img: ({ className, ...props }) => (
    <img
      alt={props.alt || ""}
      className="my-6 rounded-3xl lg:my-12"
      height={props.height}
      src={props.src}
      width={props.width}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("mx-auto list-disc text-base", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("mx-auto list-decimal text-base", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote className="!border-0 relative my-6 mt-3 lg:col-start-2 lg:col-end-11 xl:my-8">
      {" "}
      <span className="md:-mr-6 -mb-16 lg:-mr-20 absolute top-0 right-0 font-medium font-serif text-[25vw] italic leading-none">
        “
      </span>
      <span className="relative z-10 not-italic">{props.children}</span>
    </blockquote>
  ),
  hr: ({ ...props }) => (
    <hr
      className="mx-auto my-8 max-w-2xl border-stone-100 border-t-2 lg:col-start-5 lg:col-end-13"
      {...props}
    />
  ),
  Div: ({ className, ...props }) => (
    <div className={cn("my-6", className)} {...props} />
  ),
  div: ({ className, ...props }) => (
    <div
      className={cn("my-6 lg:col-start-5 lg:col-end-13", className)}
      {...props}
    />
  ),
  Iframe: ({ className, ...props }) => (
    <iframe
      allowFullScreen
      className="aspect-video h-auto w-full rounded-3xl"
      frameBorder="0"
      width={"100%"}
      {...props}
    />
  ),
  code: ({
    className,
    children,
    ...props
  }: {
    className?: string;
    children: React.ReactNode;
  }) => {
    if (className?.includes("language-bash")) {
      return <CodeBlock>{children}</CodeBlock>;
    }
    return (
      <code className={cn("font-mono text-sm", className)} {...props}>
        {children}
      </code>
    );
  },
};
