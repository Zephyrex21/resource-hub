import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { getNoteBySlug } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { GlassCard, ClayCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { Loading, ErrorState } from '../components/ui/StateViews'

// Vite-compatible worker setup for pdf.js (react-pdf's underlying PDF engine).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: note, loading, error, refetch } = useAsync(() => getNoteBySlug(slug!), [slug])

  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfError, setPdfError] = useState(false)

  if (loading) return <Loading label="Loading note…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!note) return null

  return (
    <div className="flex flex-col gap-6">
      <Link to="/notes" className="w-fit text-sm text-muted hover:text-text">
        ← Back to Notes
      </Link>

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

      <a
        href={note.fileUrl}
        download
        className="clay-btn w-fit rounded-full px-5 py-2.5 text-sm font-medium text-text"
      >
        ⭳ Download {note.fileType.toUpperCase()}
      </a>

      {note.fileType === 'pdf' && !pdfError && (
        <ClayCard className="flex flex-col items-center gap-4 overflow-hidden px-4 py-6">
          <Document
            file={note.fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() => setPdfError(true)}
            loading={<Loading label="Loading preview…" />}
          >
            <Page pageNumber={pageNumber} width={640} />
          </Document>

          {numPages && numPages > 1 && (
            <div className="flex items-center gap-4 text-sm">
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
        </ClayCard>
      )}

      {(note.fileType !== 'pdf' || pdfError) && (
        <GlassCard className="px-6 py-8 text-center text-sm text-muted">
          Preview isn't available for this file — use the download button above.
        </GlassCard>
      )}
    </div>
  )
}
