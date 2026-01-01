import { generateMetadata as genMeta } from "../lib/metadata";
import  SignupPage from "./SignupPage";

export const metadata = genMeta("signup");

export default function dcmaPage() {
  return <SignupPage />;
}