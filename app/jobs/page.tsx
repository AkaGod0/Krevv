import { generateMetadata as genMeta } from "../lib/metadata";
import JobsClient from "./JobsClient";

export const metadata = genMeta("jobs");

export default function JobsPage() {
  return <JobsClient />;
}