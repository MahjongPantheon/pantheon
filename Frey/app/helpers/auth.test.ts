import { describe, it, expect } from "vitest";
import { makeClientHash, makeHashes, verifyHash } from "./auth";

describe("Auth hashing", () => {
  it("should create hash and verify it", async () => {
    const password = "testpassword";
    const { hash, salt, clientHash } = await makeHashes(password);
    const clientHashVerify = makeClientHash(password, salt);
    expect(clientHashVerify).toEqual(clientHash);
    await verifyHash(clientHash, hash); // should not throw
  });
});
