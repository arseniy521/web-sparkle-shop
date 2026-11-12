import { describe, expect, it } from 'vitest';
import { applyParticipantDraft } from './participantCount';

describe('participant count draft', () => {
  it('lets the user clear 1 and type 4 without producing 14', () => {
    const cleared = applyParticipantDraft(1, '1', '');
    expect(cleared).toEqual({ draft: '', count: 1 });
    expect(applyParticipantDraft(cleared.count, cleared.draft, '4')).toEqual({
      draft: '4',
      count: 4,
    });
  });

  it('keeps a valid multi-digit value and rejects anything outside 1–100', () => {
    expect(applyParticipantDraft(1, '1', '14')).toEqual({ draft: '14', count: 14 });
    expect(applyParticipantDraft(4, '4', '0')).toEqual({ draft: '0', count: 4 });
    expect(applyParticipantDraft(4, '4', '101')).toEqual({ draft: '101', count: 4 });
    expect(applyParticipantDraft(4, '4', '4a')).toEqual({ draft: '4', count: 4 });
  });
});
