import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { Select } from "./select";
import { SelectHTMLAttributes } from "react";

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  defaultValue?: string;
  name?: string;
}

export function CurrencySelect({ label = "Currency", defaultValue = "USD", name = "currency", ...props }: Props) {
  return (
    <Select label={label} name={name} defaultValue={defaultValue} {...props}>
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name} ({c.symbol})
        </option>
      ))}
    </Select>
  );
}
