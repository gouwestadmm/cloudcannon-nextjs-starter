import Link from "next/link";

import { Button } from "@/components/ui/button";

type ButtonProps = {
  link?: string;
  label?: string;
  open_in_new_tab?: boolean;
  style: {
    variant?: "default" | "outline" | "link";
    size?: "default" | "sm" | "lg" | "icon";
  };
};

export function Buttons({ buttons }: { buttons: ButtonProps[] }) {
  return (
    <div className="mt-10 flex justify-center gap-x-6">
      {buttons.map((button) => (
        <Link
          href={button.link || "#"}
          key={button.link || button.label}
          target={button.open_in_new_tab ? "_blank" : "_self"}
        >
          <Button size={button.style.size} variant={button.style.variant}>
            {button.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
