import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ReportSelector from "@/components/ReportSelector";
import AuthButton from "@/components/AuthButton";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Incident Reporting System</h1>
          <AuthButton />
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Report an Incident or Collision</h2>
          <ReportSelector />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © 2023 Incident Reporting System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}