import { describe, it, expect } from 'vitest'
import { buildContextBlock, collectSources } from '../askController.js'

const sampleContext = {
  notes: [
    {
      title: 'Binary Search',
      slug: 'binary-search',
      subject: 'DSA',
      description: 'Covers the classic binary search pattern.',
      tags: ['arrays', 'search'],
      difficulty: 'beginner',
    },
  ],
  tips: [
    {
      title: 'Docker Compose Basics',
      slug: 'docker-compose-basics',
      category: 'Docker',
      summary: 'Get a multi-container app running locally.',
      contentMarkdown: '## Setup\nRun `docker compose up`.',
      tags: ['docker'],
    },
  ],
  projects: [
    {
      title: 'Resource Hub',
      slug: 'resource-hub',
      description: 'A personal developer knowledge base.',
      techStack: ['React', 'Express', 'MongoDB'],
      status: 'active',
    },
  ],
}

describe('buildContextBlock', () => {
  it('includes a [Note]/[Tip]/[Project] tagged block for each item', () => {
    const block = buildContextBlock(sampleContext)
    expect(block).toContain('[Note] "Binary Search"')
    expect(block).toContain('[Tip] "Docker Compose Basics"')
    expect(block).toContain('[Project] "Resource Hub"')
  })

  it('includes Note subject/difficulty and Tip category in the block', () => {
    const block = buildContextBlock(sampleContext)
    expect(block).toContain('subject: DSA, difficulty: beginner')
    expect(block).toContain('category: Docker')
  })

  it('truncates Tip markdown content to 1500 characters', () => {
    const longMarkdown = 'x'.repeat(3000)
    const block = buildContextBlock({
      notes: [],
      tips: [{ title: 'Long Tip', category: 'Misc', summary: 'sum', contentMarkdown: longMarkdown, tags: [] }],
      projects: [],
    })
    // The block contains the tip's summary text plus at most 1500 chars of body.
    const xCount = (block.match(/x/g) || []).length
    expect(xCount).toBe(1500)
  })

  it('handles empty context gracefully (produces an empty string, no crash)', () => {
    expect(buildContextBlock({ notes: [], tips: [], projects: [] })).toBe('')
  })

  it('handles missing optional fields (tags, techStack) without throwing', () => {
    const block = buildContextBlock({
      notes: [{ title: 'N', subject: 'DSA', difficulty: 'beginner', description: 'd' }],
      tips: [],
      projects: [{ title: 'P', description: 'd', status: 'active' }],
    })
    expect(block).toContain('[Note] "N"')
    expect(block).toContain('[Project] "P"')
  })
})

describe('collectSources', () => {
  it('maps each context item to a flat { type, title, slug } source', () => {
    const sources = collectSources(sampleContext)
    expect(sources).toEqual([
      { type: 'note', title: 'Binary Search', slug: 'binary-search' },
      { type: 'tip', title: 'Docker Compose Basics', slug: 'docker-compose-basics' },
      { type: 'project', title: 'Resource Hub', slug: 'resource-hub' },
    ])
  })

  it('returns an empty array for empty context', () => {
    expect(collectSources({ notes: [], tips: [], projects: [] })).toEqual([])
  })
})
