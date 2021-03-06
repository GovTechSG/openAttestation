// types generated by quicktype during postinstall phase
import { OpenAttestationDocument as OpenAttestationDocumentV2 } from "../__generated__/schema.2.0";
import { SchemaId, ObfuscationMetadata, ProofPurpose, ProofType } from "../shared/@types/document";

export interface Proof {
  type: ProofType;
  created: string;
  proofPurpose: ProofPurpose;
  verificationMethod: string;
  signature: string;
}
export interface Signature {
  type: "SHA3MerkleProof";
  targetHash: string;
  proof: string[];
  merkleRoot: string;
}

export interface SchematisedDocument<T extends OpenAttestationDocumentV2 = OpenAttestationDocumentV2> {
  version: SchemaId;
  data: DeepStringify<T>;
  schema?: string;
  privacy?: ObfuscationMetadata;
}

export interface WrappedDocument<T extends OpenAttestationDocumentV2 = OpenAttestationDocumentV2>
  extends SchematisedDocument<T> {
  signature: Signature;
}

export interface SignedWrappedDocument<T extends OpenAttestationDocumentV2 = OpenAttestationDocumentV2>
  extends WrappedDocument<T> {
  proof: Proof[];
}

// feel free to improve, as long as this project compile without changes :)
// once salted, every property is turned into a string
export type DeepStringify<T> = {
  [P in keyof T]: T[P] extends Array<number> // if it's a []number
    ? Array<string> // return []string
    : T[P] extends Array<string> // if it's []string
    ? Array<string> // return []string
    : T[P] extends Record<string, any> // if it's an object
    ? DeepStringify<T[P]> // apply stringify on the object
    : T[P] extends Array<Record<string, infer U>> // if it's an array of object
    ? DeepStringify<U> // apply stringify on the array
    : number extends T[P] // if it's a number
    ? string // make it a string
    : undefined extends T[P] // if it's an optional field
    ? DeepStringify<T[P]> // stringify the type
    : T[P] extends string // if it's a string
    ? string // make it a string
    : DeepStringify<T[P]>; // unknown case => apply stringify, known use case: union (Issuer | string)
};

export * from "../__generated__/schema.2.0";
