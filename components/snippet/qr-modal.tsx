'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RiQrCodeLine } from '@remixicon/react'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrModalProps {
  url: string
}

export function QrModal({ url }: QrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    if (url) {
      QRCode.toDataURL(url, {
        margin: 2,
        width: 256,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then(setQrDataUrl).catch(() => {})
    }
  }, [url])

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <RiQrCodeLine className="mr-1 size-3.5" />
            <span>QR Handoff</span>
          </Button>
        }
      />
      <DialogContent className="max-w-xs text-center">
        <DialogHeader>
          <DialogTitle className="text-center text-sm font-semibold">
            Mobile Transfer
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-2">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Snippet QR Code" className="size-48" />
          ) : (
            <div className="size-48 bg-muted animate-pulse" />
          )}
          <p className="mt-2 text-[11px] text-muted-foreground break-all">
            Scan with smartphone camera to instantly transfer this snippet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
