import { generateMetadata as genMeta } from "../lib/metadata";
import  EmployerPostingPage from "./EmployerPostingPage";

export const metadata = genMeta("employerPosting");

export default function employerPosting() {
  return <EmployerPostingPage />;
}