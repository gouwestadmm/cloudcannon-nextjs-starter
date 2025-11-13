import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const titleVariants = cva("break-normal tracking-tight antialiased", {
  variants: {
    size: {
      h1: "text-balance font-semibold text-6xl leading-[0.9]! tracking-tighter xl:text-7xl",
      h2: "text-balance font-bold text-5xl leading-[0.95] tracking-tight xl:text-6xl",
      h3: "text-balance font-medium text-3xl leading-[0.98] tracking-tight xl:text-4xl",
      h4: "text-balance text-2xl tracking-tight",
      h5: "text-balance font-bold text-2xl tracking-tight",
      h6: "text-pretty text-xl leading-tight tracking-tight",
    },
  },
  defaultVariants: {
    size: "h1",
  },
});

interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Title = forwardRef<HTMLHeadingElement, TitleProps>(
  ({ size, as, className, ...props }, ref) => {
    const Tag = as || (size as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");
    return (
      <Tag
        className={cn(titleVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Title.displayName = "Title";

const createHeadingComponent = (size: TitleProps["size"]) =>
  forwardRef<HTMLHeadingElement, Omit<TitleProps, "size">>((props, ref) => (
    <Title {...props} ref={ref} size={size} />
  ));

const H1 = createHeadingComponent("h1");
const H2 = createHeadingComponent("h2");
const H3 = createHeadingComponent("h3");
const H4 = createHeadingComponent("h4");
const H5 = createHeadingComponent("h5");
const H6 = createHeadingComponent("h6");

H1.displayName = "H1";
H2.displayName = "H2";
H3.displayName = "H3";
H4.displayName = "H4";
H5.displayName = "H5";
H6.displayName = "H6";

const pVariants = cva(
  "text-pretty font-normal tracking-[-0.02em] antialiased",
  {
    variants: {
      size: {
        default: "text-base leading-normal",
        small: "text-sm leading-tight",
        large: "text-lg leading-relaxed",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface PProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof pVariants> {
  extraClassName?: string;
}

const P = forwardRef<HTMLParagraphElement, PProps>(
  ({ size, className, extraClassName, ...props }, ref) => (
    <p
      className={cn(pVariants({ size }), className, extraClassName)}
      ref={ref}
      {...props}
    />
  )
);

P.displayName = "P";

const emphVariants = cva("relative inline-block", {
  variants: {
    color: {
      default: "before:bg-white/50",
      primary: "before:bg-primary-200",
      secondary: "before:bg-secondary-200",
    },
  },
  defaultVariants: {
    color: "default",
  },
});

interface EmphProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof emphVariants> {}

const Emph: React.FC<EmphProps> = ({ color, className, children, ...rest }) => (
  <span
    className={cn(
      emphVariants({ color }),
      "before:absolute before:inset-x-[0.5em] before:inset-y-[0.4em] before:z-0 before:block before:translate-y-1.5 before:rounded-xl before:mix-blend-hard-light",
      className
    )}
    {...rest}
  >
    <span className="relative">{children}</span>
  </span>
);

export { H1, H2, H3, H4, H5, H6, P, Emph };
