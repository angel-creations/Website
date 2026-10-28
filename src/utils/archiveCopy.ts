export function cleanArchiveTitle(title: string): string {
  return title
    .replace(/Angel['’]s Creations(?:['’]s)?/g, 'Angel Creations')
    .replace(/\bAngels Creations\b/g, 'Angel Creations')
    .replace(/\bPre\s+-\s+Wedding\b/g, 'Pre-Wedding')
    .replace(/\bSide By Side\b/g, 'Side by Side')
    .replace(/\bShow-reel\b/g, 'Showreel')
    .replace(
      'What if Parallel Universe be like',
      'What Would a Parallel Universe Be Like?'
    )
    .replace(/\s{2,}/g, ' ')
    .trim();
}
