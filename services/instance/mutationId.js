// ── PR-10: Client-generated mutation id ──────────────────────────────────────
// Round-trips through `x-mutation-id`. The server echoes it back so the client
// can confirm the response belongs to the mutation it submitted before clearing
// an optimistic-update rollback timer.

let counter = 0;

const rand = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${(++counter).toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

export const newMutationId = () => rand();
