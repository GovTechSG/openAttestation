import {
  __unsafe__use__it__at__your__own__risks__wrapDocument as wrapDocument,
  __unsafe__use__it__at__your__own__risks__wrapDocuments as wrapDocuments,
  obfuscate,
  SchemaId,
  validateSchema,
  verifySignature
} from "../..";
import { SignedWrappedDocument, WrappedDocument } from "../../3.0/types";
import {
  IdentityProofType,
  Method,
  OpenAttestationDocument,
  ProofType,
  TemplateType
} from "../../__generated__/schema.3.0";
import { cloneDeep, omit } from "lodash";
import sampleDid from "../schema/sample-credential-did.json";

const openAttestationDataWithDid = sampleDid as OpenAttestationDocument;

const openAttestationData: OpenAttestationDocument = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1",
    "https://schemata.openattestation.com/com/openattestation/1.0/OpenAttestation.v3.json",
    "https://schemata.openattestation.com/com/openattestation/1.0/CustomContext.json"
  ],
  reference: "document identifier",
  validFrom: "2010-01-01T19:23:24Z",
  issuanceDate: "2010-01-01T19:23:24Z",
  name: "document owner name",
  type: ["VerifiableCredential", "UniversityDegreeCredential"],
  credentialSubject: {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    degree: {
      type: "BachelorDegree",
      name: "Bachelor of Science in Mechanical Engineering"
    }
  },
  openAttestationMetadata: {
    template: {
      name: "any",
      type: TemplateType.EmbeddedRenderer,
      url: "http://some.example.com"
    },
    proof: {
      type: ProofType.OpenAttestationProofMethod,
      value: "0x9178F546D3FF57D7A6352bD61B80cCCD46199C2d",
      method: Method.TokenRegistry
    },
    identityProof: {
      type: IdentityProofType.DNSTxt,
      identifier: "tradetrust.io"
    }
  },
  issuer: {
    id: "http://some.example.com",
    name: "DEMO STORE"
  }
};

const datum = [
  {
    key1: "test",
    ...openAttestationData
  },
  {
    key1: "hello",
    key2: "item2",
    ...openAttestationData
  },
  {
    key1: "item1",
    key2: "true",
    key3: 3.14159,
    key4: false,
    ...openAttestationData
  },
  {
    key1: "item2",
    ...openAttestationData
  }
];

describe("3.0 E2E Test Scenarios", () => {
  describe("Issuing a single document", () => {
    const document = datum[0];

    test("fails for missing data", async () => {
      const missingData = {
        ...omit(cloneDeep(document), "issuer")
      };
      await expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        wrapDocument(missingData, {
          externalSchemaId: "http://example.com/schema.json",
          version: SchemaId.v3
        })
      ).rejects.toThrow("Invalid document");
    });
    test("creates a wrapped document", async () => {
      const wrappedDocument = await wrapDocument(
        {
          ...openAttestationData,
          key1: "test"
        },
        {
          externalSchemaId: "http://example.com/schema.json",
          version: SchemaId.v3
        }
      );
      expect(wrappedDocument.schema).toBe("http://example.com/schema.json");
      expect(wrappedDocument.key1).toEqual(expect.stringContaining("test"));
      expect(wrappedDocument.proof.type).toBe("OpenAttestationMerkleProofSignature2018");
      expect(wrappedDocument.proof.targetHash).toBeDefined();
      expect(wrappedDocument.proof.merkleRoot).toBeDefined();
      expect(wrappedDocument.proof.proofs).toEqual([]);
      expect(wrappedDocument.proof.merkleRoot).toBe(wrappedDocument.proof.targetHash);
    });
    test("creates a wrapped document with DNS-DID IdentityProof", async () => {
      const wrappedDocumentWithDnsDID = await wrapDocument(openAttestationDataWithDid, {
        externalSchemaId: "http://example.com/schema.json",
        version: SchemaId.v3
      });
      expect(wrappedDocumentWithDnsDID.schema).toBe("http://example.com/schema.json");
      expect(wrappedDocumentWithDnsDID.proof.type).toBe("OpenAttestationMerkleProofSignature2018");
      expect(wrappedDocumentWithDnsDID.proof.targetHash).toBeDefined();
      expect(wrappedDocumentWithDnsDID.proof.merkleRoot).toBeDefined();
      expect(wrappedDocumentWithDnsDID.proof.proofs).toEqual([]);
      expect(wrappedDocumentWithDnsDID.proof.merkleRoot).toBe(wrappedDocumentWithDnsDID.proof.targetHash);
      expect(wrappedDocumentWithDnsDID.openAttestationMetadata.identityProof?.type).toContain(IdentityProofType.DNSDid);
      expect(wrappedDocumentWithDnsDID.openAttestationMetadata.identityProof?.identifier).toContain(
        openAttestationDataWithDid.openAttestationMetadata.identityProof?.identifier
      );
    });
    test("checks that document is wrapped correctly", async () => {
      const wrappedDocument = await wrapDocument(document, {
        externalSchemaId: "http://example.com/schema.json",
        version: SchemaId.v3
      });
      const verified = verifySignature(wrappedDocument);
      expect(verified).toBe(true);
    });
    test("checks that document conforms to the schema", async () => {
      const wrappedDocument = await wrapDocument(document, {
        externalSchemaId: "http://example.com/schema.json",
        version: SchemaId.v3
      });
      expect(validateSchema(wrappedDocument)).toBe(true);
    });
    test("does not allow for the same merkle root to be generated", async () => {
      // This test takes some time to run, so we set the timeout to 14s
      const wrappedDocument = await wrapDocument(document, { version: SchemaId.v3 });
      const newDocument = await wrapDocument(document, { version: SchemaId.v3 });
      expect(wrappedDocument.proof.merkleRoot).not.toBe(newDocument.proof.merkleRoot);
    }, 14000);
    test("obfuscate data correctly", async () => {
      const newDocument = await wrapDocument(datum[2], { version: SchemaId.v3 });
      const obfuscatedDocument = await obfuscate(newDocument, ["key2"]);
      expect(verifySignature(obfuscatedDocument)).toBe(true);
      expect(validateSchema(obfuscatedDocument)).toBe(true);
    });
    test("obfuscate data transistively", async () => {
      const newDocument = await wrapDocument(datum[2], { version: SchemaId.v3 });
      const intermediateDocument = obfuscate(newDocument, ["key2"]);
      const obfuscatedDocument = obfuscate(intermediateDocument, ["key3"]);
      expect(obfuscate(newDocument, ["key2", "key3"])).toEqual(obfuscatedDocument);
    });
  });

  describe("Issuing a batch of documents", () => {
    test("fails if there is a malformed document", async () => {
      const malformedDatum = [
        ...datum,
        // @ts-expect-error missing properties from OpenAttestationCredential: "@context", credentialSubject, issuanceDate, issuer, and 2 more.
        {
          laurent: "task force, assemble!!"
        } as WrappedDocument
      ];
      await expect(wrapDocuments(malformedDatum)).rejects.toStrictEqual(new Error("Invalid document"));
    });
    test("creates a batch of documents if all are in the right format", async () => {
      const wrappedDocuments = await wrapDocuments(datum, {
        externalSchemaId: "http://example.com/schema.json",
        version: SchemaId.v3
      });
      wrappedDocuments.forEach((doc, i: number) => {
        expect(doc.schema).toBe("http://example.com/schema.json");
        expect(doc.proof.type).toBe("OpenAttestationMerkleProofSignature2018");
        expect(doc.key1).toEqual(expect.stringContaining(datum[i].key1));
        expect(doc.proof.targetHash).toBeDefined();
        expect(doc.proof.merkleRoot).toBeDefined();
        expect(doc.proof.proofs.length).toEqual(2);
      });
    });
    test("checks that documents are wrapped correctly", async () => {
      const wrappedDocuments = await wrapDocuments(datum, {
        externalSchemaId: "http://example.com/schema.json",
        version: SchemaId.v3
      });
      const verified = wrappedDocuments.reduce((prev, curr) => verifySignature(curr) && prev, true);
      expect(verified).toBe(true);
    });
    test("checks that documents conforms to the schema", async () => {
      const wrappedDocuments = await wrapDocuments(datum, {
        externalSchemaId: "http://example.com/schema.json",
        version: SchemaId.v3
      });
      const validatedSchema = wrappedDocuments.reduce((prev: boolean, curr: any) => validateSchema(curr) && prev, true);
      expect(validatedSchema).toBe(true);
    });
    test("does not allow for same merkle root to be generated", async () => {
      const wrappedDocuments = await wrapDocuments(datum, {
        externalSchemaId: "http://example.com/schema.json",
        version: SchemaId.v3
      });
      const newWrappedDocuments = await wrapDocuments(datum, {
        version: SchemaId.v3
      });
      expect(wrappedDocuments[0].proof.merkleRoot).not.toBe(newWrappedDocuments[0].proof.merkleRoot);
    });
  });

  describe("validate", () => {
    test("should return true when document is valid and version is 3.0", () => {
      const credential: WrappedDocument = {
        version: SchemaId.v3,
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://schemata.openattestation.com/com/openattestation/1.0/OpenAttestation.v3.json",
          "https://schemata.openattestation.com/com/openattestation/1.0/CustomContext.json",
          "https://schemata.openattestation.com/com/openattestation/1.0/DrivingLicenceCredential.json"
        ],
        reference: "SERIAL_NUMBER_123",
        name: "Republic of Singapore Driving Licence",
        issuanceDate: "2010-01-01T19:23:24Z",
        validFrom: "2010-01-01T19:23:24Z",
        issuer: {
          id: "https://example.com",
          name: "DEMO STORE"
        },
        type: ["VerifiableCredential", "DrivingLicenceCredential"],
        credentialSubject: {
          id: "did:example:SERIAL_NUMBER_123",
          class: [
            {
              type: "3",
              effectiveDate: "2010-01-01T19:23:24Z"
            },
            {
              type: "3A",
              effectiveDate: "2010-01-01T19:23:24Z"
            }
          ]
        },
        openAttestationMetadata: {
          template: {
            name: "CUSTOM_TEMPLATE",
            type: TemplateType.EmbeddedRenderer,
            url: "https://localhost:3000/renderer"
          },
          proof: {
            type: ProofType.OpenAttestationProofMethod,
            method: Method.DocumentStore,
            value: "0x9178F546D3FF57D7A6352bD61B80cCCD46199C2d"
          },
          identityProof: {
            type: IdentityProofType.DNSTxt,
            identifier: "tradetrust.io"
          }
        },
        attachments: [
          {
            fileName: "sample.pdf",
            mimeType: "application/pdf",
            data: "BASE64_ENCODED_FILE"
          }
        ],
        proof: {
          proofPurpose: "assertionMethod",
          salts: "",
          merkleRoot: "",
          privacy: {
            obfuscated: []
          },
          proofs: [],
          targetHash: "",
          type: "OpenAttestationMerkleProofSignature2018"
        }
      };
      expect(validateSchema(credential)).toStrictEqual(true);
    });
    test("should return true when document is valid and version is 3.0 and identityProof is DNS-DID", () => {
      const credential: WrappedDocument = {
        ...openAttestationDataWithDid,
        version: SchemaId.v3,
        proof: {
          proofPurpose: "assertionMethod",
          salts: "",
          merkleRoot: "",
          privacy: {
            obfuscated: []
          },
          proofs: [],
          targetHash: "",
          type: "OpenAttestationMerkleProofSignature2018"
        }
      };
      expect(validateSchema(credential)).toStrictEqual(true);
    });
    test("should return true when signed document is valid and version is 3.0 and identityProof is DNS-DID", () => {
      const credential: SignedWrappedDocument = {
        ...openAttestationDataWithDid,
        version: SchemaId.v3,
        proof: {
          proofPurpose: "assertionMethod",
          salts: "",
          merkleRoot: "",
          privacy: {
            obfuscated: []
          },
          proofs: [],
          targetHash: "",
          signature: "",
          key: "",
          type: "OpenAttestationMerkleProofSignature2018"
        }
      };
      expect(validateSchema(credential)).toStrictEqual(true);
    });
    test("should return false when document is invalid due to no DNS-DID identifier", () => {
      const credential: any = {
        ...openAttestationDataWithDid,
        openAttestationMetadata: {
          ...openAttestationDataWithDid.openAttestationMetadata,
          identityProof: {
            identifier: "tradetrust.io"
          }
        },
        version: SchemaId.v3,
        proof: {
          proofPurpose: "assertionMethod",
          salts: "",
          merkleRoot: "",
          privacy: {
            obfuscated: []
          },
          proofs: [],
          targetHash: "",
          signature: "",
          key: "",
          type: "OpenAttestationMerkleProofSignature2018"
        }
      };
      expect(validateSchema(credential)).toStrictEqual(false);
    });
    test("should default to 2.0 when document is valid and version is undefined", () => {
      expect(
        validateSchema({
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore run test with version being undefined to only ignore that part
          version: undefined,
          data: {
            issuers: [
              {
                name: "issuer.name",
                certificateStore: "0x9178F546D3FF57D7A6352bD61B80cCCD46199C2d"
              }
            ]
          },
          signature: {
            merkleRoot: "0xabc",
            proof: [],
            targetHash: "0xabc",
            type: "SHA3MerkleProof"
          }
        })
      ).toStrictEqual(true);
    });
  });

  describe("unicode", () => {
    test("should not corrupt unicode document", async () => {
      const extraData = {
        key1: "哦喷啊特特是他题哦你",
        key2: "นยำืฟะะำหะฟะรนื",
        key3: "おぺなってsたちおn",
        key4: "خحثىشففثسفشفهخى"
      };
      const document = {
        ...openAttestationData,
        ...extraData
      };
      const wrapped = await wrapDocument(document);
      expect(wrapped.proof.merkleRoot).toBeTruthy();
      expect(wrapped.key1).toBe(extraData.key1);
      expect(wrapped.key2).toBe(extraData.key2);
      expect(wrapped.key3).toBe(extraData.key3);
      expect(wrapped.key4).toBe(extraData.key4);
    });
  });
});
