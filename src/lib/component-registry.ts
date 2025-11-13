"use client";

import { useEffect } from "react";
import { Buttons } from "@/components/blocks/buttons";
import Cta from "@/components/blocks/cta";
import FeatureList from "@/components/blocks/feature-list";
import Features from "@/components/blocks/features";
import Header from "@/components/blocks/header";
import ImageWithContent from "@/components/blocks/image-with-content";
import Intro from "@/components/blocks/intro";
import LogoGrid from "@/components/blocks/logo-grid";
import MixedContent from "@/components/blocks/mixed-content";
import { registerReactComponent } from "@/lib/editable-regions/integrations/react.mjs";

const COMPONENT_REGISTRY = {
  buttons: Buttons,
  cta: Cta,
  feature_list: FeatureList,
  features: Features,
  header: Header,
  image_with_content: ImageWithContent,
  intro: Intro,
  logo_grid: LogoGrid,
  mixed_content: MixedContent,
} as const;

export function getComponent(blockType: string) {
  return (
    COMPONENT_REGISTRY[blockType as keyof typeof COMPONENT_REGISTRY] || null
  );
}

export function RegisterComponents() {
  useEffect(() => {
    for (const [key, component] of Object.entries(COMPONENT_REGISTRY)) {
      registerReactComponent(key, component);
    }
  }, []);

  return null;
}
