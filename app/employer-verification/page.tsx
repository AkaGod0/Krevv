import { generateMetadata as genMeta } from "../lib/metadata";
import  EmployerVerificationPage from "./EmployerVerificationPage";

export const metadata = genMeta("employerVerification");

export default function dcmaPage() {
  return <EmployerVerificationPage />;
}