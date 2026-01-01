import { generateMetadata as genMeta } from "../lib/metadata";
import Dcmapage from "./Dcmapage";

export const metadata = genMeta("dmca");

export default function dcmaPage() {
  return <Dcmapage />;
}