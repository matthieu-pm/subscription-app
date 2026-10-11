import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultAccount,
  parseAccount,
  bankConnection,
  addConnection,
  disconnectAccount,
} from "./account.ts";

test("legacy bank migrates without losing profile or preferences", () => {
  const { connections: _, ...legacy } = defaultAccount;
  const migrated = parseAccount({
    ...legacy,
    signedIn: true,
    onboarded: true,
    name: "Sam",
    bank: "Revolut",
    reminderDays: "7",
  });
  assert.deepEqual(migrated.connections, [bankConnection("Revolut", "4242")]);
  assert.equal(migrated.name, "Sam");
  assert.equal(migrated.signedIn, true);
  assert.equal(migrated.onboarded, true);
  assert.equal(migrated.reminderDays, "7");
});
test("same-bank and different-bank accounts persist without duplicates", () => {
  let connections = addConnection([], bankConnection("Revolut", "4242"));
  connections = addConnection(connections, bankConnection("Revolut", "8701"));
  connections = addConnection(connections, bankConnection("Monzo", "4242"));
  connections = addConnection(connections, bankConnection("Revolut", "4242"));
  assert.equal(connections.length, 3);
  assert.deepEqual(
    parseAccount(JSON.parse(JSON.stringify({ ...defaultAccount, connections })))
      .connections,
    connections,
  );
});
test("disconnecting one account preserves other connections and does not mutate input", () => {
  const connections = [
    bankConnection("Revolut", "4242"),
    bankConnection("Revolut", "8701"),
    bankConnection("Monzo", "4242"),
  ];
  const remaining = disconnectAccount(connections, connections[1].id);
  assert.deepEqual(remaining, [connections[0], connections[2]]);
  assert.equal(connections.length, 3);
  assert.deepEqual(disconnectAccount(remaining, "unknown"), remaining);
});
test("empty connections take precedence over a stale legacy bank", () => {
  assert.deepEqual(
    parseAccount({ ...defaultAccount, bank: "Revolut" }).connections,
    [],
  );
  assert.deepEqual(
    parseAccount({ ...defaultAccount, connections: [null, {}] }).connections,
    [],
  );
  assert.deepEqual(parseAccount(null), defaultAccount);
});
