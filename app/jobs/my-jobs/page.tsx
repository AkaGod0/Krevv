import { generateMetadata as genMeta } from "../../lib/metadata";
import   MyJobsPage from "./MyJobsPage";

export const metadata = genMeta("myJobs");

export default function dcmaPage() {
  return < MyJobsPage />;
}