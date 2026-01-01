import { generateMetadata as genMeta } from "../lib/metadata";
import ContactPage from "./ContactPage";

export const metadata = genMeta("contact");

export default function dcmaPage() {
  return <ContactPage />;
}