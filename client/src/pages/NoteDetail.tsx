import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNoteBySlug, getNotes, incrementDownload } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useViewTracking } from '../hooks/useViewTracking'
import { GlassCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { ShareButton } from '../components/ShareButton'
import { BookmarkButton } from '../components/BookmarkButton'
import { FilePreview } from '../components/FilePreview'
import { Loading, ErrorState } from '../components/ui/StateViews'

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: note, loading, error, refetch } = useAsync(() => getNoteBySlug(slug!), [slug])
  usePageTitle(note?.title ?? 'Notes')
  useViewTracking('notes', slug)

  // Same-subject notes, fetched as soon as the subject is known. Safe to
  // call unconditionally (before the loading/error returns below) since
  // hooks must run in the same order every render.
  const { data: related } = useAsync(
    () => (note ? getNotes({ subject: note.subject }) : Promise.resolve([])),
    [note?.subject],
  )

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
        <div className="flex gap-2">
          <BookmarkButton type="note" slug={note.slug} title={note.title} subtitle={note.subject} />
          <ShareButton />
        </div>
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

      <FilePreview fileUrl={note.fileUrl} />

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
