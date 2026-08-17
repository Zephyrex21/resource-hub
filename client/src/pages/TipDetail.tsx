import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { getTipBySlug } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { GlassCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { CodeBlock } from '../components/CodeBlock'
import { Loading, ErrorState } from '../components/ui/StateViews'

export default function TipDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: tip, loading, error, refetch } = useAsync(() => getTipBySlug(slug!), [slug])
  usePageTitle(tip?.title ?? 'Tips & Tricks')

  if (loading) return <Loading label="Loading tip…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!tip) return null

  return (
    <div className="flex flex-col gap-6">
      <Link to="/tips" className="w-fit text-sm text-muted hover:text-text">
        ← Back to Tips
      </Link>

      <div className="flex flex-col gap-3">
        <Tag variant="tips">{tip.category}</Tag>
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

      {tip.contentMarkdown && (
        <GlassCard className="prose-content px-6 py-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{ pre: CodeBlock }}
          >
            {tip.contentMarkdown}
          </ReactMarkdown>
        </GlassCard>
      )}

      {tip.fileUrl && (
        <a
          href={tip.fileUrl}
          download
          className="clay-btn w-fit rounded-full px-5 py-2.5 text-sm font-medium text-text"
        >
          ⭳ Download PDF
        </a>
      )}
    </div>
  )
}
