export function generateSlug(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled";
}

export async function resolveUniqueSlug(
  baseText: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateSlug(baseText);
  let candidate = baseSlug;
  let counter = 2;

  while (await isTaken(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter++;
    if (counter > 1000) {
      candidate = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return candidate;
}

export interface NormalizedTag {
  name: string;
  slug: string;
}

export function normalizeTags(tags: string[]): NormalizedTag[] {
  const map = new Map<string, NormalizedTag>();

  for (const raw of tags) {
    const cleaned = raw.replace(/#/g, "").trim();
    if (!cleaned) {
      continue;
    }
    const slug = generateSlug(cleaned);
    if (!slug) {
      continue;
    }
    if (!map.has(slug)) {
      map.set(slug, {
        name: cleaned,
        slug,
      });
    }
  }

  return Array.from(map.values());
}
