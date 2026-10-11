import { test } from "node:test";
import assert from "node:assert/strict";
import { initialSubscriptions, totalFor, cancelSubscription } from "./model.ts";
test("normalizes monthly and annual plans without treating annual charge as monthly", () => {
  assert.equal(totalFor(initialSubscriptions, "monthly"), 39);
  assert.equal(totalFor(initialSubscriptions, "yearly"), 468);
});
test("reported cancellation removes predictions while preserving observed history", () => {
  const apple = cancelSubscription(initialSubscriptions[0], "2026-11-14");
  assert.deepEqual(apple.history, initialSubscriptions[0].history);
  assert.equal(apple.accessEnd, "2026-11-14");
  assert.equal(
    totalFor([apple, ...initialSubscriptions.slice(1)], "monthly"),
    29,
  );
  assert.equal(
    totalFor([apple, ...initialSubscriptions.slice(1)], "yearly"),
    348,
  );
});
test("removed items are excluded from totals without deleting their history", () => {
  const removed = { ...initialSubscriptions[0], status: "removed" as const };
  assert.equal(totalFor([removed], "monthly"), 0);
  assert.equal(removed.history.length, 1);
});
