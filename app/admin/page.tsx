import { generateMetadata as genMeta } from "../lib/metadata";
import AdminDashboard from "./AdminDashboard";

export const metadata = genMeta("adminDashboard");

export default function dcmaPage() {
  return <AdminDashboard />;
}