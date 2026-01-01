import { generateMetadata as genMeta } from "../lib/metadata";
import DataRetentionPage from "./DataRetentionPage";

export const metadata = genMeta("dataRetention");

export default function dcmaPage() {
  return <DataRetentionPage />;
}