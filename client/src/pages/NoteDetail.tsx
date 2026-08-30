import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNoteBySlug, incrementDownload } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useViewTracking } from '../hooks/useViewTracking'
import { Tag } from '../components/ui/Tag'
import { DifficultyBadge } from '../components/ui/DifficultyBadge'
import { ProgressCheckbox } from '../components/ProgressCheckbox'
import { ShareButton } from '../components/ShareButton'
import { BookmarkButton } from '../components/BookmarkButton'
import { FilePreview } from '../components/FilePreview'
import { RelatedContent } from '../components/RelatedContent'
import { AIStudyTools } from '../components/AIStudyTools'
import { Loading, ErrorState } from '../components/ui/StateViews'

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: note, loading, error, refetch } = useAsync(() => getNoteBySlug(slug!), [slug])
  usePageTitle(note?.title ?? 'Notes')
  useViewTracking('notes', slug)

  const [downloadCount, setDownloadCount] = useState<number | null>(null)

  if (loading) return <Loading label="Loading note…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!note) return null

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
        <div className="flex items-center gap-2">
          <ProgressCheckbox type="note" slug={note.slug} size="md" />
          <BookmarkButton type="note" slug={note.slug} title={note.title} subtitle={note.subject} />
          <ShareButton />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={note.difficulty} />
          <Tag variant="notes">{note.subject}</Tag>
        </div>
        <h1 className="font-display text-3xl font-bold">{note.title}</h1>
        <p className="text-muted">{note.description}</p>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {note.tags.map((tag) => (
              <Tag key={tag} variant="neutral">
                {tag}
              </Tag>
            ))}
          </div>
        )}
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

      <AIStudyTools contentType="note" slug={note.slug} />

      <RelatedContent type="note" slug={note.slug} />
    </div>
  )
}
