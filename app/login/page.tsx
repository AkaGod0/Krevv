import { generateMetadata as genMeta } from "../lib/metadata";
import  LoginPage from "./LoginPage";

export const metadata = genMeta("login");

export default function dcmaPage() {
  return <LoginPage />;
}