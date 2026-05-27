import type { Metadata } from "next";
import { Builder } from "./builder";

export const metadata: Metadata = {
  title: "Builder",
  description:
    "Visual configurator — pick your options and get a ready-to-run command.",
};

export default function BuilderPage() {
  return <Builder />;
}
