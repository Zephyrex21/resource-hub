// Tailwind's content scanner finds classes by looking for literal, complete
// class-name strings in source files — it does not evaluate template
// literals. `` `showcase-accent-${i}` `` never appears as a complete token
// in the source text, so the scanner can't see it and purges the
// corresponding CSS rule from the production build even though the rule
// exists in index.css. These arrays exist so every literal class name
// appears in full somewhere in the source, keeping it in the build.
export const showcaseAccentText = ['showcase-accent-1', 'showcase-accent-2', 'showcase-accent-3'] as const
export const showcaseAccentBg = ['showcase-accent-bg-1', 'showcase-accent-bg-2', 'showcase-accent-bg-3'] as const
