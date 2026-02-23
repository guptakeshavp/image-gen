import { createFileRoute } from "@tanstack/react-router";

import FashionStudio from "@/features/fashion/fashion-studio";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
	return <FashionStudio />;
}
