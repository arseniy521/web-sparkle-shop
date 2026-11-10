import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActiveOrderGate } from './ActiveOrderGate';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}));

vi.mock('./authNavigation', () => ({
  cabinetHref: () => 'https://app.nius.cz/cabinet',
}));

describe('ActiveOrderGate', () => {
  it('sends the patient to the cabinet instead of a new form', () => {
    render(<ActiveOrderGate />);

    expect(screen.getByText('onboarding.activeOrder.title')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'onboarding.activeOrder.cta' })).toHaveAttribute(
      'href',
      'https://app.nius.cz/cabinet',
    );
  });
});
