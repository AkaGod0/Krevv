import { generateMetadata as genMeta } from "../lib/metadata";
import AboutPage from "./Aboutpage";

export const metadata = genMeta("about");

export default function dcmaPage() {
  return <AboutPage />;
}