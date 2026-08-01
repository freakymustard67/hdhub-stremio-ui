import { type Metadata } from "next";
import { SettingsContent } from "./SettingsContent";

export const metadata: Metadata = { title: "Settings", description: "HDHub Stream settings" };

export default function SettingsPage() {
  return <SettingsContent />;
}
