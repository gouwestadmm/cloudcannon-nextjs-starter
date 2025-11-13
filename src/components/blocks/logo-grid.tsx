import Image from "next/image";
import type { LogoGridBlock } from "@/../../content-collections";
import { Section } from "@/components/content/section";
import { H2, H6 } from "@/components/core/typography/typography";

export default function LogoGrid(props: LogoGridBlock) {
  return (
    <Section block={props} className="relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {props.title && (
          <H2 className="text-center" data-editable="text" data-prop="title">
            {props.title}
          </H2>
        )}

        {props.subtitle && (
          <H6
            className="mt-3 text-center"
            data-editable="text"
            data-prop="subtitle"
          >
            {props.subtitle}
          </H6>
        )}

        {props.logos && props.logos.length > 0 && (
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            {props.logos.map((logo, index) => {
              const needsText =
                logo.image?.includes("ultracite") ||
                logo.image?.includes("content-collections") ||
                logo.image?.includes("cloudcannon");

              return (
                <div
                  className="col-span-2 lg:col-span-1"
                  key={logo.name || index}
                >
                  {logo.url ? (
                    <a
                      className="block"
                      href={logo.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <LogoImage logo={logo} showText={needsText} />
                    </a>
                  ) : (
                    <LogoImage logo={logo} showText={needsText} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}

function LogoImage({
  logo,
  showText = false,
}: {
  logo: { name?: string; image?: string; image_dark?: string };
  showText?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex max-w-48 items-center justify-center">
        {logo.image && (
          <Image
            alt={logo.name || "Company logo"}
            className="max-h-10 w-full object-contain"
            height={200}
            src={logo.image}
            width={200}
          />
        )}
      </div>
      {showText && logo.name && (
        <span className="text-center font-semibold text-base">{logo.name}</span>
      )}
    </div>
  );
}
