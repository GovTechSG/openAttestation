import { cloneDeep, omit, set } from "lodash";
import {
  isSignedWrappedV2Document,
  isWrappedV2Document,
  isWrappedV3Document,
  isSignedWrappedV3Document
} from "../guard";
import {
  // eslint-disable-next-line @typescript-eslint/camelcase
  __unsafe__use__it__at__your__own__risks__wrapDocument,
  SchemaId,
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
  wrapDocument,
  WrappedDocument
} from "../../..";
import * as v3 from "../../../3.0/types";
import * as v2 from "../../../2.0/types";

describe("guard", () => {
  let wrappedV3Document: WrappedDocument<v3.OpenAttestationDocument>;
  let signedV2Document: v2.SignedWrappedDocument;
  let signedV3Document: v3.SignedWrappedDocument;
  const wrappedV2Document: WrappedDocument<v2.OpenAttestationDocument> = wrapDocument({
    issuers: [
      {
        name: "John",
        documentStore: "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
        identityProof: {
          type: v2.IdentityProofType.DNSTxt,
          location: "example.com"
        }
      }
    ]
  });
  beforeAll(async () => {
    wrappedV3Document = await __unsafe__use__it__at__your__own__risks__wrapDocument(
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1",
          "https://schemata.openattestation.com/com/openattestation/1.0/OpenAttestation.v3.json"
        ],
        issuer: {
          name: "name",
          id: "https://example.com"
        },
        issuanceDate: "2010-01-01T19:23:24Z",
        type: ["VerifiableCredential", "UniversityDegreeCredential"],
        credentialSubject: {
          id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
          degree: {
            type: "BachelorDegree",
            name: "Bachelor of Science and Arts"
          }
        },
        openAttestationMetadata: {
          proof: {
            value: "0xabcf",
            type: v3.ProofType.OpenAttestationProofMethod,
            method: v3.Method.DocumentStore
          },
          identityProof: {
            identifier: "whatever",
            type: v2.IdentityProofType.DNSTxt
          }
        },
        name: "",
        reference: "",
        template: {
          url: "https://",
          name: "",
          type: v3.TemplateType.EmbeddedRenderer
        },
        validFrom: "2010-01-01T19:23:24Z"
      },
      { version: SchemaId.v3 }
    );
    signedV2Document = await signDocument(wrappedV2Document, SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, {
      public: "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller",
      private: "0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655"
    });
    signedV3Document = await signDocument(wrappedV3Document, SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, {
      public: "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller",
      private: "0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655"
    });
  });
  describe("isWrappedV2Document", () => {
    // tests are a bit redundant with schema.test.ts
    test("should be valid", () => {
      expect(isWrappedV2Document(wrappedV2Document)).toBe(true);
    });
    test("should be invalid when document is v3", () => {
      expect(isWrappedV2Document(wrappedV3Document)).toBe(false);
    });
    test("should not be valid when document is an empty object", () => {
      expect(isWrappedV2Document({})).toBe(false);
    });
    test("should not be valid when document is null", () => {
      expect(isWrappedV2Document(null)).toBe(false);
    });
    test("should not be valid when document.data is missing", () => {
      expect(isWrappedV2Document(omit(cloneDeep(wrappedV2Document), "data"))).toBe(false);
    });
    test("should not be valid when document.data is null", () => {
      expect(isWrappedV2Document(set(cloneDeep(wrappedV2Document), "data", null))).toBe(false);
    });
    test("should not be valid when document.data.issuers is missing", () => {
      expect(isWrappedV2Document(omit(cloneDeep(wrappedV2Document), "data.issuers"))).toBe(false);
    });
    test("should not be valid when document.signature is an empty object", () => {
      expect(isWrappedV2Document(omit(cloneDeep(wrappedV2Document), "signature"))).toBe(false);
    });
    test("should not be valid when document.signature.type is missing", () => {
      expect(isWrappedV2Document(omit(cloneDeep(wrappedV2Document), "signature.type"))).toBe(false);
    });
    test("should not be valid when document.signature.type is invalid", () => {
      expect(isWrappedV2Document(set(cloneDeep(wrappedV2Document), "signature.type", "oops"))).toBe(false);
    });
    test("should not be valid when document.signature.targetHash is missing", () => {
      expect(isWrappedV2Document(omit(cloneDeep(wrappedV2Document), "signature.targetHash"))).toBe(false);
    });
    test("should not be valid when document.signature.targetHash is invalid", () => {
      expect(isWrappedV2Document(set(cloneDeep(wrappedV2Document), "signature.targetHash", "oops"))).toBe(false);
    });
    test("should not be valid when document.signature.merkleRoot is missing", () => {
      expect(isWrappedV2Document(omit(cloneDeep(wrappedV2Document), "signature.merkleRoot"))).toBe(false);
    });
    test("should not be valid when document.signature.merkleRoot is invalid", () => {
      expect(isWrappedV2Document(set(cloneDeep(wrappedV2Document), "signature.merkleRoot", "oops"))).toBe(false);
    });
    test("should not be valid when document.signature.proof is missing", () => {
      expect(isWrappedV2Document(omit(cloneDeep(wrappedV2Document), "signature.proof"))).toBe(false);
    });
    test("should not be valid when document.signature.proof is a string", () => {
      expect(isWrappedV2Document(set(cloneDeep(wrappedV2Document), "signature.proof", "oops"))).toBe(false);
    });
    test("should not be valid when document.signature.proof is an array of number", () => {
      expect(isWrappedV2Document(set(cloneDeep(wrappedV2Document), "signature.proof", [2]))).toBe(false);
    });
    test("should be valid when document.signature.proof is array of hash of 32 length", () => {
      expect(
        isWrappedV2Document(
          set(cloneDeep(wrappedV2Document), "signature.proof", [
            "50254337f2f7dba728fc6b000bdee615c79f1657665c6a668e88b5a1721c8d82"
          ])
        )
      ).toBe(true);
    });
  });

  describe("isSignedWrappedV2Document", () => {
    test("should be valid", () => {
      expect(isSignedWrappedV2Document(signedV2Document)).toBe(true);
    });
    test("should not be valid when document is null", () => {
      expect(isSignedWrappedV2Document(null)).toBe(false);
    });
    test("should not be valid when document is empty", () => {
      expect(isSignedWrappedV2Document({})).toBe(false);
    });
    test("should not be valid when document has proof only", () => {
      expect(isSignedWrappedV2Document({ proof: signedV2Document.proof })).toBe(false);
    });
    test("should not be valid when proof does not have type", () => {
      expect(isSignedWrappedV2Document(omit(cloneDeep(signedV2Document), "proof[0].type"))).toBe(false);
    });
    test("should not be valid when proof has wrong type", () => {
      expect(isSignedWrappedV2Document(set(cloneDeep(signedV2Document), "proof[0].type", "schtroumpf"))).toBe(false);
    });
    test("should not be valid when proof does not have created", () => {
      expect(isSignedWrappedV2Document(omit(cloneDeep(signedV2Document), "proof[0].created"))).toBe(false);
    });
    test("should not be valid when proof does not have proofPurpose", () => {
      expect(isSignedWrappedV2Document(omit(cloneDeep(signedV2Document), "proof[0].proofPurpose"))).toBe(false);
    });
    test("should not be valid when proof has wrong proofPurpose", () => {
      expect(isSignedWrappedV2Document(set(cloneDeep(signedV2Document), "proof[0].proofPurpose", "schtroumpf"))).toBe(
        false
      );
    });
    test("should not be valid when proof does not have verificationMethod", () => {
      expect(isSignedWrappedV2Document(omit(cloneDeep(signedV2Document), "proof[0].verificationMethod"))).toBe(false);
    });
    test("should not be valid when proof does not have signature", () => {
      expect(isSignedWrappedV2Document(omit(cloneDeep(signedV2Document), "proof[0].signature"))).toBe(false);
    });
    test("should not be valid when second proof is not valid", async () => {
      const signDocumentWith2Proofs = await signDocument(
        wrappedV2Document,
        SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
        {
          public: "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller",
          private: "0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655"
        }
      );
      // make sure the document is valid first
      expect(isSignedWrappedV2Document(signDocumentWith2Proofs)).toBe(true);
      // then remove a property from the second proof
      expect(isSignedWrappedV2Document(omit(cloneDeep(signDocumentWith2Proofs), "proof[1].signature"))).toBe(true);
    });
  });

  describe("isWrappedV3Document", () => {
    // tests are a bit redundant with schema.test.ts
    test("should be valid", () => {
      expect(isWrappedV3Document(wrappedV3Document)).toBe(true);
    });
    test("should be invalid when document is v2", () => {
      expect(isWrappedV3Document(wrappedV2Document)).toBe(false);
    });
    test("should not be valid when document is an empty object", () => {
      expect(isWrappedV3Document({})).toBe(false);
    });
    test("should not be valid when document is null", () => {
      expect(isWrappedV3Document(null)).toBe(false);
    });
    test("should not be valid when @context is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "@context"))).toBe(false);
    });
    test("should not be valid when document.proof is an empty object", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof"))).toBe(false);
    });
    test("should not be valid when document.proof.type is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof.type"))).toBe(false);
    });
    test("should not be valid when document.proof.type is invalid", () => {
      expect(isWrappedV3Document(set(cloneDeep(wrappedV3Document), "proof.type", "oops"))).toBe(false);
    });
    test("should not be valid when document.proof.targetHash is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof.targetHash"))).toBe(false);
    });
    test("should not be valid when document.proof.targetHash is invalid", () => {
      expect(isWrappedV3Document(set(cloneDeep(wrappedV3Document), "proof.targetHash", "oops"))).toBe(false);
    });
    test("should not be valid when document.proof.merkleRoot is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof.merkleRoot"))).toBe(false);
    });
    test("should not be valid when document.proof.merkleRoot is invalid", () => {
      expect(isWrappedV3Document(set(cloneDeep(wrappedV3Document), "proof.merkleRoot", "oops"))).toBe(false);
    });
    test("should not be valid when document.proof.proofs is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof.proofs"))).toBe(false);
    });
    test("should not be valid when document.proof.proofs is a string", () => {
      expect(isWrappedV3Document(set(cloneDeep(wrappedV3Document), "proof.proofs", "oops"))).toBe(false);
    });
    test("should not be valid when document.proof.proofs is an array of number", () => {
      expect(isWrappedV3Document(set(cloneDeep(wrappedV3Document), "proof.proofs", [2]))).toBe(false);
    });
    test("should be valid when document.proof.proofs is array of hash of 32 length", () => {
      expect(
        isWrappedV3Document(
          set(cloneDeep(wrappedV3Document), "proof.proofs", [
            "50254337f2f7dba728fc6b000bdee615c79f1657665c6a668e88b5a1721c8d82"
          ])
        )
      ).toBe(true);
    });
    test("should not be valid when document.proof.salts is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof.salts"))).toBe(false);
    });
    test("should not be valid when document.proof.privacy is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof.privacy"))).toBe(false);
    });
    test("should not be valid when document.proof.privacy.obfuscated is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof.privacy.obfuscated"))).toBe(false);
    });
    test("should not be valid when document.proof.privacy.obfuscated is a string", () => {
      expect(isWrappedV3Document(set(cloneDeep(wrappedV3Document), "proof.privacy.obfuscated", "oops"))).toBe(false);
    });
    test("should not be valid when document.proof.privacy.obfuscated is an array of number", () => {
      expect(isWrappedV3Document(set(cloneDeep(wrappedV3Document), "proof.privacy.obfuscated", [2]))).toBe(false);
    });
    test("should be valid when document.proof.privacy.obfuscated is array of hash of 32 length", () => {
      expect(
        isWrappedV3Document(
          set(cloneDeep(wrappedV3Document), "proof.privacy.obfuscated", [
            "50254337f2f7dba728fc6b000bdee615c79f1657665c6a668e88b5a1721c8d82"
          ])
        )
      ).toBe(true);
    });
    test("should not be valid when document.proof.proofPurpose is missing", () => {
      expect(isWrappedV3Document(omit(cloneDeep(wrappedV3Document), "proof.proofPurpose"))).toBe(false);
    });
    test("should not be valid when document.proof.proofPurpose is invalid", () => {
      expect(isWrappedV3Document(set(cloneDeep(wrappedV3Document), "proof.proofPurpose", "oops"))).toBe(false);
    });
  });

  describe("isSignedWrappedV3Document", () => {
    test("should be valid", () => {
      expect(isSignedWrappedV3Document(signedV3Document)).toBe(true);
    });
    test("should not be valid when document is null", () => {
      expect(isSignedWrappedV3Document(null)).toBe(false);
    });
    test("should not be valid when document is empty", () => {
      expect(isSignedWrappedV3Document({})).toBe(false);
    });
    test("should not be valid when proof does not have key", () => {
      expect(isSignedWrappedV3Document(omit(cloneDeep(signedV3Document), "proof.key"))).toBe(false);
    });
    test("should not be valid when proof does not have signature", () => {
      expect(isSignedWrappedV3Document(omit(cloneDeep(signedV3Document), "proof.signature"))).toBe(false);
    });
  });
});
