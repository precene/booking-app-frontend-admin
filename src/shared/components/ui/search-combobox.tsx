import { useState, type ReactNode } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "./button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "#/shared/utils/cn";

export type SearchComboboxProps<TItem> = {
  "aria-describedby"?: string;
  "aria-label"?: string;
  className?: string;
  emptyLabel: string;
  error?: boolean;
  getItemValue: (item: TItem) => string;
  id?: string;
  isLoading?: boolean;
  items: Array<TItem>;
  loadingLabel?: string;
  onSearchChange: (value: string) => void;
  onValueChange: (value: string) => void;
  placeholder: string;
  renderItem: (item: TItem) => ReactNode;
  search: string;
  searchPlaceholder: string;
  selectedLabel?: string;
  value: string;
};

export function SearchCombobox<TItem>({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  className,
  emptyLabel,
  error,
  getItemValue,
  id,
  isLoading = false,
  items,
  loadingLabel = "Loading...",
  onSearchChange,
  onValueChange,
  placeholder,
  renderItem,
  search,
  searchPlaceholder,
  selectedLabel,
  value,
}: SearchComboboxProps<TItem>) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(itemValue: string) {
    onValueChange(itemValue);
    onSearchChange("");
    setIsOpen(false);
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-describedby={ariaDescribedBy}
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          aria-invalid={error}
          className={cn(
            "w-full justify-between font-normal",
            !selectedLabel && "text-muted",
            error && "border-destructive",
            className,
          )}
          id={id}
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="truncate">{selectedLabel ?? placeholder}</span>
          <ChevronsUpDown className="text-muted size-4 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
        <Command filter={() => 1} shouldFilter={false}>
          <CommandInput
            onValueChange={onSearchChange}
            placeholder={searchPlaceholder}
            value={search}
          />
          <CommandList className="mt-2">
            <CommandEmpty>{isLoading ? loadingLabel : emptyLabel}</CommandEmpty>
            {items.map((item) => {
              const itemValue = getItemValue(item);

              return (
                <CommandItem
                  key={itemValue}
                  onSelect={() => handleSelect(itemValue)}
                  value={itemValue}
                >
                  <Check
                    className={cn("size-4", value === itemValue ? "opacity-100" : "opacity-0")}
                  />
                  {renderItem(item)}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
