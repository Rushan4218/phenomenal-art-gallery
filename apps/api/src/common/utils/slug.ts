export function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Returns the first free slug for a name: `golden-thangka`,
 * `golden-thangka-2`, `golden-thangka-3`, ...
 *
 * `exists` is injected so the helper stays free of Prisma and module knowledge.
 */
export async function uniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
