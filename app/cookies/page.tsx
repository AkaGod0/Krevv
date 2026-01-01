import { generateMetadata as genMeta } from "../lib/metadata";
import  CookiesPage from "./CookiesPage";

export const metadata = genMeta("cookies");

export default function dcmaPage() {
  return <CookiesPage />;
}