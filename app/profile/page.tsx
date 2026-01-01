import { generateMetadata as genMeta } from "../lib/metadata";
import ProfilePage from "./ProfilePage";

export const metadata = genMeta("profile");

export default function dcmaPage() {
  return <ProfilePage />;
}