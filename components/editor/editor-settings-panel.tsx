'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { TTL_OPTIONS } from '@/lib/constants'
import { RiShieldKeyholeLine, RiFireLine, RiLockPasswordLine, RiTimeLine } from '@remixicon/react'

interface EditorSettingsPanelProps {
  isEncrypted: boolean
  burnAfterRead: boolean
  expiresIn: string
  password: string
  onToggleEncrypted: (val: boolean) => void
  onToggleBurnAfterRead: (val: boolean) => void
  onExpiresInChange: (val: string) => void
  onPasswordChange: (val: string) => void
}

export function EditorSettingsPanel({
  isEncrypted,
  burnAfterRead,
  expiresIn,
  password,
  onToggleEncrypted,
  onToggleBurnAfterRead,
  onExpiresInChange,
  onPasswordChange,
}: EditorSettingsPanelProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wide">PASTE SETTINGS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <RiShieldKeyholeLine className="size-3.5 text-primary" />
              Client-Side Encryption
            </span>
            <p className="text-muted-foreground text-[11px]">
              AES-GCM-256. Key stays in URL fragment.
            </p>
          </div>
          <Switch checked={isEncrypted} onCheckedChange={onToggleEncrypted} />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-medium text-foreground">
            <RiTimeLine className="size-3.5" />
            Expiration (TTL)
          </label>
          <Select
            value={expiresIn}
            onValueChange={(val) => {
              if (val) onExpiresInChange(val)
            }}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Select TTL" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="w-(--anchor-width)">
              {TTL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1 font-medium text-destructive">
              <RiFireLine className="size-3.5" />
              Burn After Read
            </span>
            <p className="text-muted-foreground text-[11px]">
              Permanently deleted after viewing once.
            </p>
          </div>
          <Switch checked={burnAfterRead} onCheckedChange={onToggleBurnAfterRead} />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-medium text-foreground">
            <RiLockPasswordLine className="size-3.5" />
            Password Gate (Optional)
          </label>
          <Input
            type="password"
            placeholder="Set optional password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </CardContent>
    </Card>
  )
}
