import { generateMetadata as genMeta } from "../lib/metadata";
import  MyApplicationsPage from "./MyApplicationsPage";

export const metadata = genMeta("applications");

export default function dcmaPage() {
  return < MyApplicationsPage />;
}