import { Proof, WrappedDocument } from "./types";
import { sign } from "../shared/signer";
import { OpenAttestationDocument, SignedWrappedDocument } from "./types";
import { isSignedWrappedV2Document } from "../shared/utils";
import { SigningKey, SUPPORTED_SIGNING_ALGORITHM } from "../shared/@types/sign";
import { ethers } from "ethers";

export const signDocument = async <T extends OpenAttestationDocument>(
  document: SignedWrappedDocument<T> | WrappedDocument<T>,
  algorithm: SUPPORTED_SIGNING_ALGORITHM,
  keyOrSigner: ethers.Signer | SigningKey
): Promise<SignedWrappedDocument<T>> => {
  const merkleRoot = `0x${document.signature.merkleRoot}`;
  const signature = await sign(algorithm, merkleRoot, keyOrSigner);
  const proof: Proof = {
    type: "OpenAttestationSignature2018",
    created: new Date().toISOString(),
    proofPurpose: "assertionMethod",
    verificationMethod: SigningKey.guard(keyOrSigner)
      ? keyOrSigner.public
      : `did:ethr:${await keyOrSigner.getAddress()}#controller`,
    signature
  };
  return {
    ...document,
    proof: isSignedWrappedV2Document(document) ? [...document.proof, proof] : [proof]
  };
};
