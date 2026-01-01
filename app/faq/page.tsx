import { generateMetadata as genMeta } from "../lib/metadata";
import FAQPage from "./FAQPage";

export const metadata = genMeta("faq");

export default function dcmaPage() {
  return <FAQPage />;
}