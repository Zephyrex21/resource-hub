import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useContainerWidth } from '../hooks/useContainerWidth'
import { ClayCard, GlassCard } from './ui/Card'
import { Loading } from './ui/StateViews'

// Vite-compatible worker setup for pdf.js (react-pdf's underlying PDF engine).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const ZOOM_MIN = 0.7
const ZOOM_MAX = 2
const ZOOM_STEP = 0.15

function getExtension(url: string): string {
  const clean = url.split('?')[0].split('#')[0]
  const parts = clean.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

function Unavailable() {
  return (
    <GlassCard className="px-6 py-8 text-center text-sm text-muted">
      Preview isn't available for this file — use the download button above.
    </GlassCard>
  )
}

function PdfPreview({ fileUrl }: { fileUrl: string }) {
  const { ref: viewerRef, width: viewerWidth } = useContainerWidth<HTMLDivElement>(640)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [pdfError, setPdfError] = useState(false)

  if (pdfError) return <Unavailable />

  return (
    <ClayCard className="flex flex-col items-center gap-4 px-4 py-6">
      <div ref={viewerRef} className="w-full max-w-[640px] overflow-x-auto">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setPdfError(true)}
          loading={<Loading label="Loading document…" />}
        >
          {viewerWidth > 0 && (
            // Page has its own async render step *after* the document
            // finishes loading — without this `loading` prop, the numPages
            // count appears (from onLoadSuccess) before the canvas has
            // actually painted, leaving a blank box in between.
            <Page
              pageNumber={pageNumber}
              width={viewerWidth * zoom}
              loading={<Loading label="Rendering page…" />}
            />
          )}
        </Document>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="clay-btn rounded-full px-4 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-muted">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="clay-btn rounded-full px-4 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Zoom out"
            className="clay-btn flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
          >
            −
          </button>
          <span className="w-12 text-center text-muted">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Zoom in"
            className="clay-btn flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
    </ClayCard>
  )
}

function DocxPreview({ fileUrl }: { fileUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`)
        return res.blob()
      })
      .then(async (blob) => {
        if (cancelled || !containerRef.current) return undefined
        // Loaded on demand — most notes are PDFs, so this keeps that
        // (common) path from paying for docx-preview's bundle weight.
        const { renderAsync } = await import('docx-preview')
        containerRef.current.innerHTML = ''
        return renderAsync(blob, containerRef.current, undefined, {
          ignoreWidth: true,
          ignoreHeight: true,
        })
      })
      .then(() => {
        if (!cancelled) setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [fileUrl])

  if (status === 'error') return <Unavailable />

  return (
    <ClayCard className="overflow-x-auto px-4 py-6">
      {status === 'loading' && <Loading label="Loading document…" />}
      {/* docx-preview renders real black-on-white document styling, so this
          area intentionally opts out of the site's dark theme. */}
      <div
        ref={containerRef}
        className={`mx-auto max-w-[720px] text-black ${status === 'loading' ? 'hidden' : ''}`}
      />
    </ClayCard>
  )
}

interface FilePreviewProps {
  fileUrl: string
}

export function FilePreview({ fileUrl }: FilePreviewProps) {
  const ext = getExtension(fileUrl)

  if (ext === 'pdf') return <PdfPreview fileUrl={fileUrl} />
  if (ext === 'docx') return <DocxPreview fileUrl={fileUrl} />

  return <Unavailable />
}
