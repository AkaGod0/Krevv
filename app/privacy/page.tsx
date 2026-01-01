import { generateMetadata as genMeta } from "../lib/metadata";
import  PrivacyPage from "./PrivacyPage";

export const metadata = genMeta("privacy");

export default function dcmaPage() {
  return <PrivacyPage />;
}