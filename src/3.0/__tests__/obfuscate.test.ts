/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { obfuscateVerifiableCredential } from "../obfuscate";
import { __unsafe__use__it__at__your__own__risks__wrapDocument as wrapDocument, verifySignature } from "../..";
import { Salt, WrappedDocument } from "../../3.0/types";
import { get } from "lodash";
import { decodeSalt } from "../salt";

import { SchemaId } from "../../shared/@types/document";
import * as v3 from "../../__generated__/schema.3.0";
import { Method, OpenAttestationDocument, ProofType } from "../../__generated__/schema.3.0";
import { toBuffer } from "../../shared/utils";

jest.mock("../../3.0/validate"); // Skipping schema verification while wrapping

const openAttestationData: OpenAttestationDocument = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1",
    "https://schemata.openattestation.com/com/openattestation/1.0/OpenAttestation.v3.json",
    "https://schemata.openattestation.com/com/openattestation/1.0/CustomContext.json"
  ],
  issuanceDate: "2010-01-01T19:23:24Z",
  name: "document owner name",
  type: ["VerifiableCredential", "AlumniCredential"],
  credentialSubject: {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    alumniOf: "Example University",
    array: ["one", "two", "three", "four"],
    arrayOfObject: [
      { foo: "bar", doo: "foo" },
      { foo: "baz", doo: "faz" }
    ]
  },
  issuer: "https://example.edu/issuers/14",
  openAttestationMetadata: {
    proof: {
      type: ProofType.OpenAttestationProofMethod,
      value: "0x9178F546D3FF57D7A6352bD61B80cCCD46199C2d",
      method: Method.TokenRegistry
    },
    identityProof: {
      identifier: "some.example",
      type: v3.IdentityProofType.DNSTxt
    }
  },
  attachments: [
    {
      mimeType: "image/png",
      fileName: "aaa",
      data: "abcd"
    },
    {
      mimeType: "image/png",
      fileName: "bbb",
      data: "abcd"
    }
  ]
};

const testData = {
  key1: "value1",
  key2: "value2",
  keyObject: { foo: "bar", bar: "dod" },
  ...openAttestationData
};

const findSaltByPath = (salts: string, path: string): Salt | undefined => {
  return decodeSalt(salts).find(salt => salt.path === path);
};

/**
 * /!\ This method doesn't work with array like notation
 * This method will ensure
 * - the field has been added to the obfuscated array
 * - the salt bound to the field has been removed
 * - the field has been removed
 */
const expectRemovedFieldsWithoutArrayNotation = (
  field: string,
  document: WrappedDocument,
  obfuscatedDocument: WrappedDocument
) => {
  const value = get(document, field);
  const salt = findSaltByPath(document.proof.salts, field);

  expect(obfuscatedDocument.proof.privacy.obfuscated).toContain(
    toBuffer({ [field]: `${salt?.value}:${value}` }).toString("hex")
  );
  expect(findSaltByPath(obfuscatedDocument.proof.salts, field)).toBeUndefined();
  expect(obfuscatedDocument).not.toHaveProperty(field);
};

describe("privacy", () => {
  describe("obfuscateDocument", () => {
    test("removes one field from the root object", async () => {
      const field = "key1";
      const newDocument = await wrapDocument(testData, { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscateVerifiableCredential(newDocument, field);
      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectRemovedFieldsWithoutArrayNotation(field, newDocument, obfuscatedDocument);
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(1);
    });
    test("removes one object from the root object", async () => {
      const field = "keyObject";
      const expectedFieldsToBeRemoved = ["keyObject.foo", "keyObject.bar"];
      const newDocument = await wrapDocument(testData, { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscateVerifiableCredential(newDocument, field);

      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectedFieldsToBeRemoved.forEach(field => {
        expectRemovedFieldsWithoutArrayNotation(field, newDocument, obfuscatedDocument);
      });
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(2);
    });
    test("removes one key of an object from an array", async () => {
      const field = "credentialSubject.arrayOfObject[0].foo";
      const newDocument = await wrapDocument(testData, { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscateVerifiableCredential(newDocument, field);

      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      const value = get(newDocument, field);
      const salt = findSaltByPath(newDocument.proof.salts, field);

      expect(obfuscatedDocument.proof.privacy.obfuscated).toContain(
        toBuffer({ [field]: `${salt?.value}:${value}` }).toString("hex")
      );
      expect(findSaltByPath(obfuscatedDocument.proof.salts, field)).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      expect(obfuscatedDocument.credentialSubject.arrayOfObject![0]).toStrictEqual({ doo: "foo" });
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(1);
    });
    test("removes one object from an array", async () => {
      const field = "credentialSubject.arrayOfObject[0]";
      const expectedFieldsToBeRemoved = [
        "credentialSubject.arrayOfObject[0].foo",
        "credentialSubject.arrayOfObject[0].doo"
      ];
      const newDocument = await wrapDocument(testData, { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscateVerifiableCredential(newDocument, field);

      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectedFieldsToBeRemoved.forEach(field => {
        const value = get(newDocument, field);
        const salt = findSaltByPath(newDocument.proof.salts, field);

        expect(obfuscatedDocument.proof.privacy.obfuscated).toContain(
          toBuffer({ [field]: `${salt?.value}:${value}` }).toString("hex")
        );
        expect(findSaltByPath(obfuscatedDocument.proof.salts, field)).toBeUndefined();
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      expect(obfuscatedDocument.credentialSubject.arrayOfObject![0]).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      expect(obfuscatedDocument.credentialSubject.arrayOfObject![1]).not.toBeUndefined(); // let's make sure only the first item has been removed
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(2);
    });
    test("removes an array of object", async () => {
      const field = "attachments";
      const expectedFieldsToBeRemoved = [
        "attachments[0].mimeType",
        "attachments[0].fileName",
        "attachments[0].data",
        "attachments[1].mimeType",
        "attachments[1].fileName",
        "attachments[1].data"
      ];
      const newDocument = await wrapDocument(testData, { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscateVerifiableCredential(newDocument, field);

      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectedFieldsToBeRemoved.forEach(field => {
        const value = get(newDocument, field);
        const salt = findSaltByPath(newDocument.proof.salts, field);

        expect(obfuscatedDocument.proof.privacy.obfuscated).toContain(
          toBuffer({ [field]: `${salt?.value}:${value}` }).toString("hex")
        );
        expect(findSaltByPath(obfuscatedDocument.proof.salts, field)).toBeUndefined();
      });
      expect(obfuscatedDocument.attachments).toBeUndefined();
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(6);
    });

    test("removes multiple fields", async () => {
      const fields = ["key1", "key2"];
      const newDocument = await wrapDocument(testData, { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscateVerifiableCredential(newDocument, fields);
      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      fields.forEach(field => {
        expectRemovedFieldsWithoutArrayNotation(field, newDocument, obfuscatedDocument);
      });
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(2);
    });

    test("removes values from nested object", async () => {
      const field = "credentialSubject.alumniOf";
      const newDocument = await wrapDocument(openAttestationData, { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscateVerifiableCredential(newDocument, field);
      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectRemovedFieldsWithoutArrayNotation(field, newDocument, obfuscatedDocument);
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(1);
    });

    test("removes values from arrays", async () => {
      const fields = ["credentialSubject.array[2]", "credentialSubject.array[3]"];
      const newDocument = await wrapDocument(openAttestationData, { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscateVerifiableCredential(newDocument, fields);
      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      const salts = decodeSalt(newDocument.proof.salts);
      const salt1 = salts.find(s => s.path === fields[0]);
      const value1 = get(newDocument, fields[0]);
      const salt2 = salts.find(s => s.path === fields[1]);
      const value2 = get(newDocument, fields[1]);

      expect(obfuscatedDocument.proof.privacy.obfuscated).toEqual([
        toBuffer({ [fields[0]]: `${salt1?.value}:${value1}` }).toString("hex"),
        toBuffer({ [fields[1]]: `${salt2?.value}:${value2}` }).toString("hex")
      ]);
      expect(findSaltByPath(obfuscatedDocument.proof.salts, fields[0])).toBeUndefined();
      expect(findSaltByPath(obfuscatedDocument.proof.salts, fields[1])).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore not typable
      expect(obfuscatedDocument.credentialSubject.array).not.toContain("three");
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore not typable
      expect(obfuscatedDocument.credentialSubject.array).not.toContain("four");
    });

    test("is transitive", async () => {
      const newDocument = await wrapDocument(testData, { version: SchemaId.v3 });
      const intermediateDoc = obfuscateVerifiableCredential(newDocument, "key1");
      const finalDoc1 = obfuscateVerifiableCredential(intermediateDoc, "key2");
      const finalDoc2 = obfuscateVerifiableCredential(newDocument, ["key1", "key2"]);

      expect(finalDoc1).toEqual(finalDoc2);
      expect(intermediateDoc).not.toHaveProperty("key1");
      expect(finalDoc1).not.toHaveProperty("key1");
      expect(finalDoc1).not.toHaveProperty("key2");
      expect(finalDoc2).not.toHaveProperty("key1");
      expect(finalDoc2).not.toHaveProperty("key2");
    });
  });
});
