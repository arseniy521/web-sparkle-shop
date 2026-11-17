// Ports and origins of the four local test servers. NIU-17: every port moves by
// NIUS_PORT_OFFSET so engineers working in separate worktrees can run the browser checks at
// the same time. With no variable set the ports are 8080, 8081, 8090 and 8091.
function readOffset(): number {
  const raw = process.env.NIUS_PORT_OFFSET;
  if (raw === undefined || raw === '') return 0;
  if (!/^\d+$/.test(raw)) {
    throw new Error(`NIUS_PORT_OFFSET must be an integer >= 0, got "${raw}"`);
  }
  return Number(raw);
}

export const PORT_OFFSET = readOffset();

/** Old site, served from the reference build (.baseline/dist) for the visual check. */
export const OLD_PORT = 8081 + PORT_OFFSET;
/** New site, served from the visual test build (.checks/dist-test). */
export const NEW_PORT = 8080 + PORT_OFFSET;
/** New site, served from the e2e build (.checks/dist-e2e) for the browser scenarios. */
export const E2E_PORT = 8090 + PORT_OFFSET;
/** The reference build merged with a test build of the new site, as for a release (.checks/release-dist). */
export const MERGED_PORT = 8091 + PORT_OFFSET;

export const OLD_ORIGIN = `http://localhost:${OLD_PORT}`;
export const NEW_ORIGIN = `http://localhost:${NEW_PORT}`;
export const E2E_ORIGIN = `http://localhost:${E2E_PORT}`;
export const MERGED_ORIGIN = `http://localhost:${MERGED_PORT}`;
/** The scenarios origin by IP, for tests that need a host other than `localhost`. */
export const E2E_ORIGIN_IP = `http://127.0.0.1:${E2E_PORT}`;
