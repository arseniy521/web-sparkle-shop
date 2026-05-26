export const MenuSection = () => {
  return (
    <section id="menu" className="py-16 md:py-24" style={{ padding: '100px 48px', background: 'var(--color-bg)' }}>
      <nius-menu section="menu-packages"></nius-menu>
    </section>
  );
};

export const SubscriptionSection = () => {
  return (
    <section id="membership" className="py-16 md:py-24" style={{ padding: '100px 48px', background: 'var(--color-bg)' }}>
      <nius-menu section="subscription"></nius-menu>
    </section>
  );
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'nius-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { section?: string; 'accent-color'?: string; locale?: string }, HTMLElement>;
    }
  }
}
