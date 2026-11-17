// Port and origin of the local test server of the browser scenarios. NIU-17: the port moves by
// NIUS_PORT_OFFSET so engineers working in separate worktrees can run the browser checks at
// the same time. With no variable set the port is 8090.
function readOffset(): number {
  const raw = process.env.NIUS_PORT_OFFSET;
  if (raw === undefined || raw === '') return 0;
  if (!/^\d+$/.test(raw)) {
    throw new Error(`NIUS_PORT_OFFSET must be an integer >= 0, got "${raw}"`);
  }
  return Number(raw);
}

export const PORT_OFFSET = readOffset();

/** New site, served from the e2e build (.checks/dist-e2e) for the browser scenarios. */
export const E2E_PORT = 8090 + PORT_OFFSET;

export const E2E_ORIGIN = `http://localhost:${E2E_PORT}`;
/** The scenarios origin by IP, for tests that need a host other than `localhost`. */
export const E2E_ORIGIN_IP = `http://127.0.0.1:${E2E_PORT}`;
