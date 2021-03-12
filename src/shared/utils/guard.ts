import { SchemaId, SignedWrappedDocument } from "../..";
import {
  OpenAttestationDocument as OpenAttestationDocumentV3,
  VerifiableCredentialProofBase,
  VerifiableCredentialProofSigned,
  WrappedDocument as WrappedDocumentV3
} from "../../3.0/types";
import {
  ArrayProof,
  OpenAttestationDocument as OpenAttestationDocumentV2,
  Signature,
  WrappedDocument as WrappedDocumentV2
} from "../../2.0/types";
import { getSchema, validateSchema as validate } from "../validate";

export const isWrappedV3Document = (document: any): document is WrappedDocumentV3<OpenAttestationDocumentV3> => {
  if (!document || typeof document !== "object" || document.version !== SchemaId.v3) return false;
  const validateSchema = () => validate(document, getSchema(SchemaId.v3)).length === 0;
  const validateProof = () => VerifiableCredentialProofBase.guard(document.proof);
  return validateSchema() && validateProof();
};

export const isWrappedV2Document = (document: any): document is WrappedDocumentV2<OpenAttestationDocumentV2> => {
  if (!document || typeof document !== "object") return false;
  const validateSchema = () => validate(document, getSchema(SchemaId.v2)).length === 0;
  const validateSignature = () => Signature.guard(document.signature);
  return validateSchema() && validateSignature();
};

export const isSignedWrappedV2Document = (
  document: any
): document is SignedWrappedDocument<OpenAttestationDocumentV2> => {
  const validateWrappedDocument = () => isWrappedV2Document(document);
  const validateProof = () => !!(document.proof && ArrayProof.guard(document.proof) && document.proof.length > 0);
  return validateWrappedDocument() && validateProof();
};
export const isSignedWrappedV3Document = (
  document: any
): document is SignedWrappedDocument<OpenAttestationDocumentV3> => {
  const validateWrappedDocument = () => isWrappedV3Document(document);
  const validateProof = () => !!(document.proof && VerifiableCredentialProofSigned.guard(document.proof));
  return validateWrappedDocument() && validateProof();
};
