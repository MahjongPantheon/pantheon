import bcrypt from "bcrypt";
import { sha1, sha384 } from "./crypto";

export const makeClientHash = (password: string, salt: string) => {
  return sha384(password + salt);
};

export const verifyHash = async (clientHash: string, authHash: string) => {
  authHash = authHash.replace("$2y$", "$2a$");
  return new Promise<void>((resolve, reject) => {
    bcrypt.compare(clientHash, authHash, function (_, res) {
      if (res) {
        resolve();
      } else {
        reject("Password check failed");
      }
    });
  });
};

export const makeHashes = async (password: string) => {
  const salt = new Date().getUTCMilliseconds().toString();
  const saltHashed = sha1(salt);
  const clientHash = makeClientHash(password, saltHashed);
  return bcrypt.hash(clientHash, 2).then((hash) => {
    return { hash, salt: saltHashed, clientHash };
  });
};
