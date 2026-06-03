/**
 * WebAuthn Passkey encoding/decoding utilities.
 * Handles binary conversions of cryptographic keys and signatures.
 */

export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Simple client-side WebAuthn wrappers to convert raw credentials
 */
export async function createCredentialOptions(optionsJSON: any): Promise<Credential | null> {
  if (!navigator.credentials || !navigator.credentials.create) {
    throw new Error('WebAuthn is not supported on this device/browser.');
  }

  // Convert Base64Url strings back to ArrayBuffers
  const makeCredOptions: PublicKeyCredentialCreationOptions = {
    ...optionsJSON,
    challenge: base64UrlToBuffer(optionsJSON.challenge),
    user: {
      ...optionsJSON.user,
      id: base64UrlToBuffer(optionsJSON.user.id),
    },
    excludeCredentials: (optionsJSON.excludeCredentials ?? []).map((cred: any) => ({
      ...cred,
      id: base64UrlToBuffer(cred.id),
    })),
  };

  const credential = (await navigator.credentials.create({
    publicKey: makeCredOptions,
  })) as PublicKeyCredential;

  if (!credential) return null;

  const response = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
      transports: typeof response.getTransports === 'function' ? response.getTransports() : [],
    },
  } as any;
}

export async function getAssertionOptions(optionsJSON: any): Promise<Credential | null> {
  if (!navigator.credentials || !navigator.credentials.get) {
    throw new Error('WebAuthn is not supported on this device/browser.');
  }

  const getOptions: PublicKeyCredentialRequestOptions = {
    ...optionsJSON,
    challenge: base64UrlToBuffer(optionsJSON.challenge),
    allowCredentials: (optionsJSON.allowCredentials ?? []).map((cred: any) => ({
      ...cred,
      id: base64UrlToBuffer(cred.id),
    })),
  };

  const assertion = (await navigator.credentials.get({
    publicKey: getOptions,
  })) as PublicKeyCredential;

  if (!assertion) return null;

  const response = assertion.response as AuthenticatorAssertionResponse;

  return {
    id: assertion.id,
    rawId: bufferToBase64Url(assertion.rawId),
    type: assertion.type,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
    },
  } as any;
}
