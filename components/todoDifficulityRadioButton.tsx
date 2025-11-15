import { useId } from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TodoDifficultyLevel } from "@/constants/todoRewards";

type Props = {
  value: TodoDifficultyLevel;
  onChange: (value: TodoDifficultyLevel) => void;
  disabled?: boolean;
};

export default function TodoDifficultyRadioButton({
  value,
  onChange,
  disabled = false,
}: Props) {
  const id = useId();

  const renderOption = (
    optionValue: TodoDifficultyLevel,
    label: string,
    roundedClass: string
  ) => (
    <div key={optionValue} className={`flex-1 ${roundedClass}`}>
      <RadioGroupItem
        id={`${id}-${optionValue}`}
        value={optionValue}
        className="peer sr-only"
        disabled={disabled}
      />
      <label
        htmlFor={`${id}-${optionValue}`}
        className={`relative flex min-h-12 w-full cursor-pointer items-center justify-center border border-input bg-card px-2 text-center text-sm font-medium transition-[color,background-color,box-shadow] outline-none ${roundedClass} aria-disabled:cursor-not-allowed aria-disabled:opacity-50 hover:border-muted-foreground hover:bg-muted/80 peer-data-[state=checked]:z-10 peer-data-[state=checked]:border-muted-foreground peer-data-[state=checked]:bg-muted peer-data-[state=checked]:text-foreground`}
      >
        <span>{label}</span>
      </label>
    </div>
  );

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm leading-none font-medium text-foreground">
        Todoの難易度
      </legend>
      <RadioGroup
        className="flex gap-0 rounded-md shadow-xs"
        value={value}
        onValueChange={(next) => onChange(next as TodoDifficultyLevel)}
        disabled={disabled}
      >
        {renderOption(
          "easy",
          "簡単",
          "first:rounded-s-md rounded-l-md"
        )}
        {renderOption("normal", "普通", "rounded-none")}
        {renderOption(
          "hard",
          "難しい",
          "last:rounded-e-md rounded-r-md"
        )}
      </RadioGroup>
    </fieldset>
  );
}
