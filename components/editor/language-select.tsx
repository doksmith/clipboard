'use client'

import { SUPPORTED_LANGUAGES, type LanguageOption } from '@/lib/constants'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox'

interface LanguageSelectProps {
  value: string
  onSelect: (langId: string) => void
}

export function LanguageSelect({ value, onSelect }: LanguageSelectProps) {
  const selectedLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === value) || {
      id: 'text',
      name: 'Plain Text',
      extension: 'txt',
    }

  return (
    <Combobox
      items={SUPPORTED_LANGUAGES}
      value={selectedLang}
      onValueChange={(val: LanguageOption | null) => {
        if (val) {
          onSelect(val.id)
        }
      }}
      itemToStringLabel={(item: LanguageOption) => item.name}
      itemToStringValue={(item: LanguageOption) => item.id}
    >
      <ComboboxInput
        placeholder="Select language..."
        className="h-7 text-xs"
      />
      <ComboboxContent align="start">
        <ComboboxList>
          {(item: LanguageOption) => (
            <ComboboxItem key={item.id} value={item}>
              <span className="flex-1">{item.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase">
                .{item.extension}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No language found</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}
