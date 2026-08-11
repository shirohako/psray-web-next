/**
 * Progressively enhance a public trophy-set link with the profile currently in
 * context. Crawlers, copied links, new-tab gestures, and no-JS navigation keep
 * the clean public href; an ordinary click opens the viewer-progress variant.
 */
export function openTrophyWithProgress(
  event: MouseEvent,
  trophySetId: number,
  psnid: string,
) {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
  ) return

  event.preventDefault()
  return navigateTo({
    path: `/trophies/${trophySetId}`,
    query: { psnid },
  })
}
