'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RiQrCodeLine, RiDownloadLine } from '@remixicon/react'

interface QrModalProps {
  url: string
}

export function QrModal({ url }: QrModalProps) {
  // Gunakan endpoint API /api/qr dengan format SVG & browser HTTP caching
  const encodedUrl = encodeURIComponent(url)
  const qrSvgUrl = `/api/qr?text=${encodedUrl}&format=svg&size=256&margin=2`
  const qrDownloadUrl = `/api/qr?text=${encodedUrl}&format=png&size=512&margin=2&download=true`

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
          <div className="flex size-48 items-center justify-center rounded-lg border bg-white p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSvgUrl}
              alt="Snippet QR Code"
              width={176}
              height={176}
              className="size-full object-contain"
              loading="lazy"
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground break-all">
            Scan with smartphone camera to instantly transfer this snippet.
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 h-7 text-xs text-muted-foreground hover:text-foreground"
            nativeButton={false}
            render={
              <a href={qrDownloadUrl} download="qrcode.png">
                <RiDownloadLine className="mr-1 size-3.5" />
                Download PNG
              </a>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
