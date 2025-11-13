import Link from 'next/link';
import { Section } from '@/components/content/section';
import { H2, P } from '@/components/core/typography/typography';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  return {
    title: 'Niet gevonden',
  };
}

export default function NotFound() {
  return (
    <Section
      className="flex h-screen w-screen items-center justify-center"
      variant="primary"
      watermark="bottom_left"
    >
      <div className="text-center">
        <H2 className="text-white">Niet gevonden</H2>
        <P className="mt-3">Deze pagina bestaat (nog) niet (meer)</P>
        <Link href="/">
          <Button className="mt-6" variant="ghost">
            naar de homepage
          </Button>
        </Link>
      </div>
    </Section>
  );
}
