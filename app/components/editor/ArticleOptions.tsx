import React from "react";
import {
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { getOptionLabel, getOptionIcon } from "@/app/utils/optionsHelper";

export type OptionItem = {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type OptionSection = {
  title: string;
  stateKey: string;
  options: OptionItem[];
};

interface ArticleOptionsProps {
  sections: OptionSection[];
  currentValues: Record<string, string>;
  onValueChange: (stateKey: string, value: string) => void;
  openPopovers: Record<string, boolean>;
  setOpenPopovers: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export function ArticleOptions({
  sections,
  currentValues,
  onValueChange,
  openPopovers,
  setOpenPopovers,
}: ArticleOptionsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {sections.map((section) => {
        const currentValue = currentValues[section.stateKey] || "";
        const CurrentIcon = getOptionIcon(section, currentValue);

        return (
          <Popover
            key={section.stateKey}
            placement="bottom"
            isOpen={openPopovers[section.stateKey] || false}
            onOpenChange={(open) =>
              setOpenPopovers((prev) => ({
                ...prev,
                [section.stateKey]: open,
              }))
            }
          >
            <PopoverTrigger>
              <Button
                variant="light"
                size="sm"
                color="secondary"
                className="text-default/75"
                startContent={
                  CurrentIcon && <CurrentIcon className="w-4 h-4" />
                }
              >
                {getOptionLabel(section, currentValue)}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Listbox
                aria-label={section.title}
                variant="flat"
                selectionMode="single"
                color="secondary"
                selectedKeys={[currentValue]}
              >
                <ListboxSection>
                  {section.options.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <ListboxItem
                        key={option.key}
                        description={option.description}
                        startContent={
                          <IconComponent className="w-5 h-5 flex-shrink-0" />
                        }
                        onPress={() => {
                          onValueChange(section.stateKey, option.key);
                          setOpenPopovers((prev) => ({
                            ...prev,
                            [section.stateKey]: false,
                          }));
                        }}
                        textValue={option.key}
                      >
                        <span>{option.label}</span>
                      </ListboxItem>
                    );
                  })}
                </ListboxSection>
              </Listbox>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
