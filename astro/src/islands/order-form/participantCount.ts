/** Keep an in-progress number editable, including a temporarily empty field. */
export function applyParticipantDraft(
  currentCount: number,
  currentDraft: string,
  raw: string,
): { draft: string; count: number } {
  if (raw !== '' && !/^\d{1,3}$/.test(raw)) {
    return { draft: currentDraft, count: currentCount };
  }
  const value = Number(raw);
  if (raw !== '' && Number.isInteger(value) && value >= 1 && value <= 100) {
    return { draft: raw, count: value };
  }
  return { draft: raw, count: currentCount };
}
