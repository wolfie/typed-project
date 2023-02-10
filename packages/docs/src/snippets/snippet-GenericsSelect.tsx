import { useEffect, useState } from "preact/hooks";

type SelectProps<T> = { options: Readonly<T[]>; value: T; onChange: (newValue: T) => void };
const Select = <T extends string>({ options, value, onChange }: SelectProps<T>) => (
  <select value={value} onChange={e => onChange(e.currentTarget.value as T)}>
    {options.map(option => (
      <option>{option}</option>
    ))}
  </select>
);

const OPTIONS = ["option 1", "option 2", "option 3"] as const;
type Option = typeof OPTIONS[number]; // "option 1" | "option 2" | "option 3"
export default ({ log }: { log: typeof console.log }) => {
  const [value, setValue] = useState<Option>(OPTIONS[1]);

  useEffect(() => log(`Value changed to "${value}"`), [value]);

  return <Select options={OPTIONS} value={value} onChange={setValue} />;
};
