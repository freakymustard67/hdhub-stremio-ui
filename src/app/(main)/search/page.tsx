import { type Metadata } from "next";
import { SearchResults } from "@/components/SearchResults";

export const metadata: Metadata = { title: "Search", description: "Search movies and series on HDHub" };

export default function SearchPage() {
  return <div className="container mx-auto px-4 py-8"><SearchResults /></div>;
}
