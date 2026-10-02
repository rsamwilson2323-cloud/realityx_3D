import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/world/Studio";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "REALITYX – 3D World Builder" },
      { name: "description", content: "Build, edit, explore and export interactive 3D worlds in your browser." },
      { property: "og:title", content: "REALITYX – 3D World Builder" },
      { property: "og:description", content: "Build Beyond Reality. Create 3D worlds right in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});
