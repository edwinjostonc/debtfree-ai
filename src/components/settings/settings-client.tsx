"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrencyInfo, SUPPORTED_CURRENCIES } from "@/lib/currency";
import { CheckCircle } from "lucide-react";

interface Props {
  baseCurrency: string;
  name: string;
  email: string;
}

export function SettingsClient({ baseCurrency, name, email }: Props) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const curr = getCurrencyInfo(baseCurrency);

  async function handleSave(formData: FormData) {
    setLoading(true);
    setError("");
    setSaved(false);
    const result = await updateSettings(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Currency Preferences</CardTitle></CardHeader>
        <CardContent>
          <form action={handleSave} className="space-y-4">
            <div>
              <CurrencySelect
                label="Base Currency"
                name="baseCurrency"
                defaultValue={baseCurrency}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                All totals and payoff calculations convert to this currency using live exchange rates.
                Each debt, income, and expense can still use its own currency.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" loading={loading} size="md">
              {saved ? (
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Saved!
                </span>
              ) : "Save Preferences"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Supported Currencies</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-slate-500">
            {SUPPORTED_CURRENCIES.length} currencies supported. Exchange rates from{" "}
            <a href="https://frankfurter.app" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              frankfurter.app
            </a>{" "}
            (European Central Bank data, updated daily, free).
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_CURRENCIES.map((c) => (
              <span
                key={c.code}
                className={`rounded-lg px-2 py-1 text-xs font-medium ${
                  c.code === baseCurrency
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {c.code}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-medium">{name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Base Currency</span>
              <span className="font-medium">{curr.code} — {curr.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
