import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { baseCurrency: true, name: true, email: true },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account and currency preferences</p>
      </div>
      <SettingsClient
        baseCurrency={user?.baseCurrency ?? "USD"}
        name={user?.name ?? ""}
        email={user?.email ?? ""}
      />
    </div>
  );
}
