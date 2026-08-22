import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getRelated, type RelatedContentType } from '../lib/api'
import { GlassCard } from './ui/Card'
import { Tag } from './ui/Tag'
import { containerVariants, itemVariants } from './motionVariants'

const TYPE_LABEL: Record<RelatedContentType, string> = {
  note: 'Note',
  tip: 'Tip',
  project: 'Project',
}

const TYPE_TAG_VARIANT: Record<RelatedContentType, 'notes' | 'tips' | 'projects'> = {
  note: 'notes',
  tip: 'tips',
  project: 'projects',
}

const TYPE_ROUTE: Record<RelatedContentType, string> = {
  note: '/notes',
  tip: '/tips',
  project: '/projects',
}

interface RelatedContentProps {
  type: RelatedContentType
  slug: string
  heading?: string
}

// Cross-type "related" rail shown on Note/Tip/Project detail pages. Backed
// by the server's tag-overlap scoring, so — unlike the old "just show more
// notes in this subject" approach — a Note can surface a relevant Tip or
// Project alongside other Notes when their tags genuinely overlap.
export function RelatedContent({ type, slug, heading = 'You might also like' }: RelatedContentProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['related', type, slug],
    queryFn: () => getRelated(type, slug),
  })

  if (isLoading || isError || !data || data.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-semibold">{heading}</h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {data.map((item) => (
          <motion.div key={`${item.type}-${item.slug}`} variants={itemVariants}>
            <Link to={`${TYPE_ROUTE[item.type]}/${item.slug}`}>
              <GlassCard className="flex h-full flex-col gap-2 px-4 py-4 transition-shadow hover:shadow-[var(--card-shadow-hover)]">
                <Tag variant={TYPE_TAG_VARIANT[item.type]}>{TYPE_LABEL[item.type]}</Tag>
                <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                <p className="line-clamp-2 text-xs text-muted">{item.description || item.summary}</p>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
