import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { getNoteBySlug, getNotes, incrementDownload } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { useContainerWidth } from '../hooks/useContainerWidth'
import { usePageTitle } from '../hooks/usePageTitle'
import { GlassCard, ClayCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { ShareButton } from '../components/ShareButton'
import { Loading, ErrorState } from '../components/ui/StateViews'

// Vite-compatible worker setup for pdf.js (react-pdf's underlying PDF engine).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const ZOOM_MIN = 0.7
const ZOOM_MAX = 2
const ZOOM_STEP = 0.15

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: note, loading, error, refetch } = useAsync(() => getNoteBySlug(slug!), [slug])
  usePageTitle(note?.title ?? 'Notes')
  const { ref: viewerRef, width: viewerWidth } = useContainerWidth<HTMLDivElement>(640)

  // Same-subject notes, fetched as soon as the subject is known. Safe to
  // call unconditionally (before the loading/error returns below) since
  // hooks must run in the same order every render.
  const { data: related } = useAsync(
    () => (note ? getNotes({ subject: note.subject }) : Promise.resolve([])),
    [note?.subject],
  )

  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfError, setPdfError] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [downloadCount, setDownloadCount] = useState<number | null>(null)

  if (loading) return <Loading label="Loading note…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!note) return null

  const relatedNotes = (related ?? []).filter((n) => n.slug !== note.slug).slice(0, 3)
  const displayedDownloads = downloadCount ?? note.downloadCount

  function handleDownloadClick() {
    setDownloadCount((c) => (c ?? note!.downloadCount) + 1)
    incrementDownload(note!.slug).catch(() => undefined) // fire-and-forget; UI already updated
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link to="/notes" className="w-fit text-sm text-muted hover:text-text">
          ← Back to Notes
        </Link>
        <ShareButton />
      </div>

      <div className="flex flex-col gap-3">
        <Tag variant="notes">{note.subject}</Tag>
        <h1 className="font-display text-3xl font-bold">{note.title}</h1>
        <p className="text-muted">{note.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
            <Tag key={tag} variant="neutral">
              {tag}
            </Tag>
          ))}
          <span className="ml-auto text-xs uppercase tracking-wide text-muted">
            {note.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={note.fileUrl}
          download
          onClick={handleDownloadClick}
          className="clay-btn w-fit rounded-full px-5 py-2.5 text-sm font-medium text-text"
        >
          ⭳ Download {note.fileType.toUpperCase()}
        </a>
        <span className="text-xs text-muted">
          {displayedDownloads} download{displayedDownloads === 1 ? '' : 's'}
        </span>
      </div>

      {note.fileType === 'pdf' && !pdfError && (
        <ClayCard className="flex flex-col items-center gap-4 px-4 py-6">
          <div ref={viewerRef} className="w-full max-w-[640px] overflow-x-auto">
            <Document
              file={note.fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => setPdfError(true)}
              loading={<Loading label="Loading preview…" />}
            >
              {viewerWidth > 0 && <Page pageNumber={pageNumber} width={viewerWidth * zoom} />}
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
      )}

      {(note.fileType !== 'pdf' || pdfError) && (
        <GlassCard className="px-6 py-8 text-center text-sm text-muted">
          Preview isn't available for this file — use the download button above.
        </GlassCard>
      )}

      {relatedNotes.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold">More in {note.subject}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedNotes.map((n) => (
              <Link key={n._id} to={`/notes/${n.slug}`}>
                <GlassCard className="flex h-full flex-col gap-2 px-4 py-4 transition-transform hover:-translate-y-1">
                  <h3 className="text-sm font-semibold leading-snug">{n.title}</h3>
                  <p className="line-clamp-2 text-xs text-muted">{n.description}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
