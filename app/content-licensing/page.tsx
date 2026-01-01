import { generateMetadata as genMeta } from "../lib/metadata";
import ContentLicensingPage from "./ContentLicensingPage";

export const metadata = genMeta("contentLicensing");

export default function dcmaPage() {
  return <ContentLicensingPage />;
}