import { generateMetadata as genMeta } from "../lib/metadata";
import  TermsPage from "./TermsPage";

export const metadata = genMeta("terms");

export default function dcmaPage() {
  return <TermsPage />;
}