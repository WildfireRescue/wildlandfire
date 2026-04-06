// AdminRoute: lazy boundary that loads AuthProvider + Supabase only when
// the /blog/editor path is accessed. Public visitors never load supabase-js.
import { AuthProvider } from "../../../contexts/AuthContext";
import { BlogEditorPage } from "./BlogEditorPage";

export default function AdminRoute() {
  return (
    <AuthProvider>
      <BlogEditorPage />
    </AuthProvider>
  );
}
