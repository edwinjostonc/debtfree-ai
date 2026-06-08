import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={session.user.name} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
