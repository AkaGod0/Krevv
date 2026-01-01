import { generateMetadata as genMeta } from "../lib/metadata";
import  PostsPage from "./PostsPage";

export const metadata = genMeta("posts");

export default function dcmaPage() {
  return <PostsPage />;
}