import { generateMetadata as genMeta } from "../lib/metadata";
import AntiScamPage from "./Antiscampage";

export const metadata = genMeta("antiScam");

export default function dcmaPage() {
  return <AntiScamPage />;
}