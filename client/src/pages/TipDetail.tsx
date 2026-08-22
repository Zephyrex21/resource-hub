import type { ComponentPropsWithoutRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { getTipBySlug } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useViewTracking } from '../hooks/useViewTracking'
import { extractHeadings } from '../lib/markdown'
import { GlassCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { CodeBlock } from '../components/CodeBlock'
import { ShareButton } from '../components/ShareButton'
import { BookmarkButton } from '../components/BookmarkButton'
import { FilePreview } from '../components/FilePreview'
import { TableOfContents } from '../components/TableOfContents'
import { ReadingProgressBar } from '../components/ReadingProgressBar'
import { RelatedContent } from '../components/RelatedContent'
import { Loading, ErrorState } from '../components/ui/StateViews'
import { estimateReadingTime } from '../lib/readingTime'
import { ProgressCheckbox } from '../components/ProgressCheckbox'

export default function TipDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: tip, loading, error, refetch } = useAsync(() => getTipBySlug(slug!), [slug])
  usePageTitle(tip?.title ?? 'Tips & Tricks')
  useViewTracking('tips', slug)

  if (loading) return <Loading label="Loading tip…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!tip) return null

  const headings = tip.contentMarkdown ? extractHeadings(tip.contentMarkdown) : []
  const readingTime = tip.contentMarkdown ? estimateReadingTime(tip.contentMarkdown) : null
  let headingIndex = 0

  // Ids are pre-computed from the raw markdown source (see extractHeadings)
  // and assigned here in document order, since react-markdown renders
  // headings in the same order they appear in the source.
  function H2(props: ComponentPropsWithoutRef<'h2'>) {
    const heading = headings[headingIndex]
    headingIndex++
    return <h2 id={heading?.id} {...props} />
  }
  function H3(props: ComponentPropsWithoutRef<'h3'>) {
    const heading = headings[headingIndex]
    headingIndex++
    return <h3 id={heading?.id} {...props} />
  }

  return (
    <div className="flex flex-col gap-6">
      {tip.contentMarkdown && <ReadingProgressBar />}

      <div className="flex items-center justify-between">
        <Link to="/tips" className="w-fit text-sm text-muted hover:text-text">
          ← Back to Tips
        </Link>
        <div className="flex items-center gap-2">
          <ProgressCheckbox type="tip" slug={tip.slug} size="md" />
          <BookmarkButton type="tip" slug={tip.slug} title={tip.title} subtitle={tip.category} />
          <ShareButton />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Tag variant="tips">{tip.category}</Tag>
          {readingTime && <span className="text-xs text-muted">· {readingTime} min read</span>}
        </div>
        <h1 className="font-display text-3xl font-bold">{tip.title}</h1>
        <p className="text-muted">{tip.summary}</p>

        {tip.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tip.tags.map((tag) => (
              <Tag key={tag} variant="neutral">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {headings.length >= 2 && <TableOfContents headings={headings} />}

      {tip.contentMarkdown && (
        <GlassCard className="prose-content px-6 py-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{ pre: CodeBlock, h2: H2, h3: H3 }}
          >
            {tip.contentMarkdown}
          </ReactMarkdown>
        </GlassCard>
      )}

      {tip.fileUrl && (
        <>
          <a
            href={tip.fileUrl}
            download
            className="clay-btn w-fit rounded-full px-5 py-2.5 text-sm font-medium text-text"
          >
            ⭳ Download {tip.fileUrl.split('?')[0].split('.').pop()?.toUpperCase() ?? 'file'}
          </a>
          <FilePreview fileUrl={tip.fileUrl} />
        </>
      )}

      <RelatedContent type="tip" slug={tip.slug} />
    </div>
  )
}
