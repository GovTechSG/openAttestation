import * as utils from "../utils";
// eslint-disable-next-line @typescript-eslint/camelcase
import { __unsafe__use__it__at__your__own__risks__wrapDocument, wrapDocument } from "../../..";
import { SchemaId, WrappedDocument } from "../../../shared/@types/document";
import * as v2 from "../../../__generated__/schema.2.0";
import * as v3 from "../../../__generated__/schema.3.0";

describe("Util Functions", () => {
  let wrappedV3Document: WrappedDocument<v3.OpenAttestationDocument>;
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
  });

  describe("hashArray", () => {
    test("should work", () => {
      const res = utils.hashArray(["a", "b", "1", 5]);

      const expectedHashResults = [
        "660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc",
        "9261495095bfbb82deedb97b2be90d0f4c0d9a03fdd90a9da62c1bbcc45d7eb2",
        "a78c7e6cf27e778ce55aaa2a786943f1578bc76edcb296abc95981c786bb89c1",
        "ceebf77a833b30520287ddd9478ff51abbdffa30aa90a8d655dba0e8a79ce0c1"
      ];

      expect(res.map(p => p.toString("hex"))).toEqual(expectedHashResults);
    });
  });

  describe("bufSortJoin", () => {
    test("should work", () => {
      const res = utils.bufSortJoin(Buffer.from("c"), Buffer.from("b"), Buffer.from("a"));
      const expectedResults = "616263";
      expect(res.toString("hex")).toEqual(expectedResults);
    });
  });

  describe("hashToBuffer", () => {
    test("should work", () => {
      expect(utils.hashToBuffer("foo")).toEqual(Buffer.from("foo", "hex"));
    });

    test("should do nothing if the input is a hash", () => {
      const originalBuffer = Buffer.from("foo", "utf8");
      expect(utils.hashToBuffer(originalBuffer)).toEqual(originalBuffer);
    });
  });

  describe("toBuffer", () => {
    test("should work", () => {
      expect(utils.toBuffer("foo").toString("hex")).toEqual(
        "837fb5aa99ab7d0392fa43e61f529f072a693fd38032cd4a039793a9f9b4ea42"
      );
    });

    test("should do nothing if the input is a hash", () => {
      const originalBuffer = utils.toBuffer("foo");
      expect(utils.toBuffer(originalBuffer)).toEqual(originalBuffer);
    });
  });

  describe("combineHashBuffers", () => {
    test("should combine two hashes (in buffer format) and return result as a string", () => {
      expect(
        utils
          .combineHashBuffers(
            utils.hashToBuffer("660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc"),
            utils.hashToBuffer("9261495095bfbb82deedb97b2be90d0f4c0d9a03fdd90a9da62c1bbcc45d7eb2")
          )
          .toString("hex")
      ).toBe("6a4fe9cb57c9f79964c0408f25d70a73b3448bc6e975d0a905f0f8694764954b");
    });

    test("should return original hash if only one is given", () => {
      expect(
        utils
          .combineHashBuffers(utils.hashToBuffer("660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc"))
          .toString("hex")
      ).toBe("660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc");
      expect(
        utils
          .combineHashBuffers(
            undefined,
            utils.hashToBuffer("660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc")
          )
          .toString("hex")
      ).toBe("660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc");
    });
  });

  describe("combineHashString", () => {
    test("should combine two hashes (in string format) and return result as a string", () => {
      expect(
        utils.combineHashString(
          "660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc",
          "9261495095bfbb82deedb97b2be90d0f4c0d9a03fdd90a9da62c1bbcc45d7eb2"
        )
      ).toBe("6a4fe9cb57c9f79964c0408f25d70a73b3448bc6e975d0a905f0f8694764954b");
    });

    test("should return original hash if only one is given", () => {
      expect(utils.combineHashString("660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc")).toBe(
        "660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc"
      );
      expect(
        utils.combineHashString(undefined, "660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc")
      ).toBe("660c9a8d0051d07b1abd38e8a6f68076d98fdf948abd2a13e2870fe08a1343cc");
    });
  });

  describe("getIssuerAddress", () => {
    test("should return all issuers address for 2.0 document using certificate store", async () => {
      const document: WrappedDocument<v2.OpenAttestationDocument> = await wrapDocument({
        issuers: [
          {
            certificateStore: "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
            name: "nameA"
          },
          {
            certificateStore: "0x1234123412341234123412341234123412341234",
            name: "nameA"
          }
        ]
      });
      expect(utils.getIssuerAddress(document)).toStrictEqual([
        "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
        "0x1234123412341234123412341234123412341234"
      ]);
    });
    test("should return all issuers address for 2.0 document using document store", async () => {
      const document: WrappedDocument<v2.OpenAttestationDocument> = await wrapDocument({
        issuers: [
          {
            documentStore: "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
            identityProof: {
              type: v2.IdentityProofType.DNSTxt,
              location: ""
            },
            name: "nameA"
          },
          {
            documentStore: "0x1234123412341234123412341234123412341234",
            identityProof: {
              type: v2.IdentityProofType.DNSTxt,
              location: ""
            },
            name: "nameA"
          }
        ]
      });
      expect(utils.getIssuerAddress(document)).toStrictEqual([
        "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
        "0x1234123412341234123412341234123412341234"
      ]);
    });
    test("should return all issuers address for 2.0 document using token registry", async () => {
      const document: WrappedDocument<v2.OpenAttestationDocument> = await wrapDocument({
        issuers: [
          {
            tokenRegistry: "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
            identityProof: {
              type: v2.IdentityProofType.DNSTxt,
              location: ""
            },
            name: "nameA"
          },
          {
            tokenRegistry: "0x1234123412341234123412341234123412341234",
            identityProof: {
              type: v2.IdentityProofType.DNSTxt,
              location: ""
            },
            name: "nameA"
          }
        ]
      });
      expect(utils.getIssuerAddress(document)).toStrictEqual([
        "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
        "0x1234123412341234123412341234123412341234"
      ]);
    });
    test("should return all issuers address for 3.0 document", async () => {
      // This test takes some time to run, so we set the timeout to 14s
      expect(utils.getIssuerAddress(wrappedV3Document)).toStrictEqual("0xabcf");
    });
  });

  describe("getMerkleRoot", () => {
    test("should return merkleroot for v2.0 document", async () => {
      const document: WrappedDocument<any> = {
        version: SchemaId.v2,
        data: wrappedV2Document.data,
        signature: {
          type: "SHA3MerkleProof",
          targetHash: "64b2ed566455d0adbc798a8f824f163d87276dcbd66cacff8a6a4ba28fb800fc",
          proof: [],
          merkleRoot: "64b2ed566455d0adbc798a8f824f163d87276dcbd66cacff8a6a4ba28fb800fc"
        }
      };
      expect(utils.getMerkleRoot(document)).toStrictEqual(
        "64b2ed566455d0adbc798a8f824f163d87276dcbd66cacff8a6a4ba28fb800fc"
      );
    });

    test("should return merkleroot for v3.0 document", async () => {
      const document: WrappedDocument<v3.OpenAttestationDocument> = {
        ...wrappedV3Document,
        proof: {
          type: "OpenAttestationMerkleProofSignature2018",
          proofPurpose: "assertionMethod",
          targetHash: "6e3b3b131db956263d142f42a840962d31359fff61c28937d9d1add0ca04c89e",
          proofs: [],
          merkleRoot: "6e3b3b131db956263d142f42a840962d31359fff61c28937d9d1add0ca04c89e",
          salts:
            "W3sidmFsdWUiOiJjNzEzMjQ0MTg4Y2VlNjE0ZmY4YmI5YjM1M2Y0ZTAzNTVkYWE4OTc1MzQ4ZWMzYjM0MGQ1ZTM2YTI1NjM1NjBiIiwicGF0aCI6InZlcnNpb24ifSx7InZhbHVlIjoiMzcxOTRiZmJhYzdjNGQ1NjcyYzFlMGM5OGVjNGE3OWFlYmZiZDczZTUwOTQ5MTJhY2IxN2Q1YjRkZjMwZmYzNiIsInBhdGgiOiJAY29udGV4dFswXSJ9LHsidmFsdWUiOiI4YWI1MGRjMWJlYTgzNzk0NmJjOTU2OTU2NGRmOGMxYTY2NjU1YTAwMzA3ZmQ4NGZlZmI3ZGEyMDZmZjUzNmY2IiwicGF0aCI6IkBjb250ZXh0WzFdIn0seyJ2YWx1ZSI6IjdlMjgzMTVhYzVkYzZlMDExNTRmNjhkZDQ1YmNmZWZlNzViYWU2NzhjM2Q3NTM4YTE0MTRkNTdlZDcwZjBjOTEiLCJwYXRoIjoiQGNvbnRleHRbMl0ifSx7InZhbHVlIjoiNGQzYzExODdiOWE4ODMyZWU3OGY2ZThhZWI4MzAxODU1OWM0ZTE2NDA3MDYxYTQ0NjBmMDliM2RhNDI3NTI1MSIsInBhdGgiOiJAY29udGV4dFszXSJ9LHsidmFsdWUiOiJhOGViNzdjNmEyMzk4OWM2ZjAzN2Q5Nzg2MzE2YzIwZWI5YjI0OTRlN2YwMzM0ODAyZTUxYzRjMWQ4OGRiYjlhIiwicGF0aCI6InJlZmVyZW5jZSJ9LHsidmFsdWUiOiJmMTgzNzE4MGUzZjU1NWY3NzgxODExM2FiYTU3NGZjMDdlOWVmZWUzZGMxZjUwYzMyMWExNDI4YjAzMWJiZTQ1IiwicGF0aCI6Im5hbWUifSx7InZhbHVlIjoiMjZjNWZiZTZmYmM4MDhmY2JhMzBlYmMyMTllNjI0NTJkMmE2ZDQ5ZWQ3YWQ0MjNiNjdmY2IyNGQ1M2Y4OTc5NSIsInBhdGgiOiJpc3N1YW5jZURhdGUifSx7InZhbHVlIjoiNWZmY2I0ZDE4YjUwMmY2NWI5ZWMyMDA1ZmJiMzE2NzcwMjBhZjczMWYwNGM2MmJhMjZjNWY4ZDA2M2FjODJiMSIsInBhdGgiOiJ2YWxpZEZyb20ifSx7InZhbHVlIjoiMzVjZjU5YTUyODBlMGI3OWIwOTg1OWIwODNhOGYwMGQwZjFhMTZlMjZmZDhhZGE2MjdjNzA1MGQ4NWIxNTcwMyIsInBhdGgiOiJpc3N1ZXIuaWQifSx7InZhbHVlIjoiZDkzZTdhYzJmMDg2Y2E1ZWU4ZTI5NjU1ZjM4Y2YzNzc5ZTZlYjhkOWFiMzNkNjAyYmNkNzc2YjlmOGJhNzcxNiIsInBhdGgiOiJpc3N1ZXIubmFtZSJ9LHsidmFsdWUiOiI4YjY1ZjcyNjk4ZjBjOTk2NDA1NTgzZTA5OTEzZDE2NGZhM2FiMGFiZGFkYTI1OTY4MmUzNDZlMjBkM2NhY2VlIiwicGF0aCI6InR5cGVbMF0ifSx7InZhbHVlIjoiMjZjYmVmNjY2NDJiOGE0MTIwZTMzYTI1NjExZGUzMTlkY2U1NzgwYmYzMTNjOWM5ZWM1MGQ0OTJmOTNhODk1ZiIsInBhdGgiOiJ0eXBlWzFdIn0seyJ2YWx1ZSI6ImY5ZTZjMWRhYWZlNGM3NjU4ZGY5ZmM0OGRhM2M0YjM3MzgxYzZlN2Y5YmExYmRlYjViOGFjNjM1Yjg4ZTY2MDAiLCJwYXRoIjoiY3JlZGVudGlhbFN1YmplY3QuaWQifSx7InZhbHVlIjoiMjRiNDUyYjI0NzdiMWY0OGU3Nzc2M2UzMmY3MDg1YjNkNWM5ZTBjOGUwZmM4NWVmNGU4NTgxNjQ3YTQ0YzYwYyIsInBhdGgiOiJjcmVkZW50aWFsU3ViamVjdC5jbGFzc1swXS50eXBlIn0seyJ2YWx1ZSI6IjBhYjU3MTQ1NWQzNTdlYmUzNjA2NzQ0OGFiOTZkOGIwZWIzYTY0MzM3YTVjZmUxMjRlYTE1YzgxYTJjZTAyNDYiLCJwYXRoIjoiY3JlZGVudGlhbFN1YmplY3QuY2xhc3NbMF0uZWZmZWN0aXZlRGF0ZSJ9LHsidmFsdWUiOiJlMzhmN2ExZWFlZjFiNGZmMzYwZjQ3YjJiNzM5ZjA1YWQ1ZDE4NTg3ZDJhMThkOGIwYjhjOTBjZTI4Y2FiMWQ4IiwicGF0aCI6ImNyZWRlbnRpYWxTdWJqZWN0LmNsYXNzWzFdLnR5cGUifSx7InZhbHVlIjoiYjBhZDZhZmE5ZDI0NzJjMTRjN2U5NWQ4M2Y4YmJkZGNmNzQzYjkzNjU2YzEyMDg4YmFjODg4MTIzZjkxMjM4MSIsInBhdGgiOiJjcmVkZW50aWFsU3ViamVjdC5jbGFzc1sxXS5lZmZlY3RpdmVEYXRlIn0seyJ2YWx1ZSI6IjEwMTkyYzhjOGZiZGM4MjlmZGRkYjYzYWIwNWE5OWZkZjFhZTBhN2IzMzMyMDFkY2MxZmIwZWRjZGVhMTQ5NzQiLCJwYXRoIjoib3BlbkF0dGVzdGF0aW9uTWV0YWRhdGEudGVtcGxhdGUubmFtZSJ9LHsidmFsdWUiOiI4M2ViNTE1OTAyNzc4MzkyZjczZmQzM2ZmZjliNzQ1NzNkMGZkZmExMmY2NjNhOTgzMjYzMjgwZjQ1OTBiNzZkIiwicGF0aCI6Im9wZW5BdHRlc3RhdGlvbk1ldGFkYXRhLnRlbXBsYXRlLnR5cGUifSx7InZhbHVlIjoiODcwMDk5ZTMxNjRjNzA4Y2IzZTFlZjlmOGM0Njk3ZDVmYTFiMTVjOWM5ZGJlZThlMDdiZDgxZTE0OWYyNTNhOCIsInBhdGgiOiJvcGVuQXR0ZXN0YXRpb25NZXRhZGF0YS50ZW1wbGF0ZS51cmwifSx7InZhbHVlIjoiMmZiOTczMzIwMDQxYTRkMmIxODJkODBhNDRiMDA5YmY5ZmZhODJlMjVkMTMyYzg4YWVmYzk1Y2UzYzVlNmQ5ZCIsInBhdGgiOiJvcGVuQXR0ZXN0YXRpb25NZXRhZGF0YS5wcm9vZi50eXBlIn0seyJ2YWx1ZSI6IjNjNjNiM2RjYTIwYjg4Yzc4MmE0NDRjYzA5OTlkNTdhMjFhNzIyZThhY2JlZjlhNWU3YzFmODJmNzkwYzY4ODAiLCJwYXRoIjoib3BlbkF0dGVzdGF0aW9uTWV0YWRhdGEucHJvb2YubWV0aG9kIn0seyJ2YWx1ZSI6IjY3N2FiYmIzOGIzZjhmM2Y3ZjBlYTQ1NGRkMjA0NDQ3OTFjZGI4MjU4MDk1MGM4NmRhNjc5ZmIzZDM2YjIxNTMiLCJwYXRoIjoib3BlbkF0dGVzdGF0aW9uTWV0YWRhdGEucHJvb2YudmFsdWUifSx7InZhbHVlIjoiNzg0YjdkMTI3NjY1MWY2NzA0MjJhZmMyM2U2ZTcyNTZiYWI2NjVmN2IzMjk5N2U4NGNmOWJhZDhjZjllMzYzZiIsInBhdGgiOiJvcGVuQXR0ZXN0YXRpb25NZXRhZGF0YS5pZGVudGl0eVByb29mLnR5cGUifSx7InZhbHVlIjoiNTdjNzRhNmIwYzg0Mzg5M2JhN2Y0MzZhYTgwOTNkNDE0MWMwYmZhODgzZjMwY2NhNDUwZDM4M2Y5OTQ2N2NlYSIsInBhdGgiOiJvcGVuQXR0ZXN0YXRpb25NZXRhZGF0YS5pZGVudGl0eVByb29mLmlkZW50aWZpZXIifSx7InZhbHVlIjoiYjM2MmFmMWU1YmI4MTg5MDg1YTRhMzI0YzI0MzAwZWNiMDNjNGExZTRlMTkwMTMzYTAyNjNkM2UzOWNkYThkNSIsInBhdGgiOiJhdHRhY2htZW50c1swXS5maWxlTmFtZSJ9LHsidmFsdWUiOiJmMmU3NzAyYjNhMzc4NDJkNWVjY2E2ZTFjOGU2MmIxZjYxN2I0OTZjMTJiOGIzOGE3ZjA2OTZkZThiN2RkODMwIiwicGF0aCI6ImF0dGFjaG1lbnRzWzBdLm1pbWVUeXBlIn0seyJ2YWx1ZSI6Ijc3NDRjMjQ1ZGQyMTJiY2I0OGI3YWU4MjYyMWY5YjAyMjFiYzg0MDAyOGY0YjJmMTIzNjE5NzQwYjE0N2Q3ZWQiLCJwYXRoIjoiYXR0YWNobWVudHNbMF0uZGF0YSJ9XQ==",
          privacy: {
            obfuscated: []
          }
        }
      };
      expect(utils.getMerkleRoot(document)).toStrictEqual(
        "6e3b3b131db956263d142f42a840962d31359fff61c28937d9d1add0ca04c89e"
      );
    });
  });
});
