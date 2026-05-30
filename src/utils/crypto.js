const PBKDF2_ITERATIONS = 310000;
const SALT_BYTES = 16;
const AES_IV_BYTES = 12;
const HASH_BYTES = 32;
const LEGACY_SHA256_HEX_LENGTH = 64;

const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...bytes));

const base64ToBytes = (base64) => Uint8Array.from(atob(base64), char => char.charCodeAt(0));

const derivePinHash = async (pin, salt) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_BYTES * 8,
  );

  return new Uint8Array(bits);
};

const deriveAesKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

const constantTimeEqual = (left, right) => {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }
  return diff === 0;
};

const legacySha256 = async (pin) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export const isLegacyPinHash = (storedHash) => (
  typeof storedHash === 'string'
  && storedHash.length === LEGACY_SHA256_HEX_LENGTH
  && /^[a-f0-9]+$/i.test(storedHash)
);

export const hashPin = async (pin) => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derivePinHash(pin, salt);
  return `${bytesToBase64(salt)}:${bytesToBase64(hash)}`;
};

export const verifyPin = async (pin, storedHash) => {
  if (!storedHash) return true;

  if (isLegacyPinHash(storedHash)) {
    return legacySha256(pin).then(hash => hash === storedHash);
  }

  const [saltBase64, hashBase64] = storedHash.split(':');
  if (!saltBase64 || !hashBase64) return false;

  const salt = base64ToBytes(saltBase64);
  const expectedHash = base64ToBytes(hashBase64);
  const actualHash = await derivePinHash(pin, salt);
  return constantTimeEqual(actualHash, expectedHash);
};

export const encryptJson = async (payload, password) => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(AES_IV_BYTES));
  const key = await deriveAesKey(password, salt);
  const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedPayload);

  return {
    encrypted: true,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2-SHA-256',
    iterations: PBKDF2_ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  };
};

export const decryptJson = async (payload, password) => {
  const key = await deriveAesKey(password, base64ToBytes(payload.salt));
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.data),
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
};

/**
 * Mantiene compatibilidad con el sistema de ofuscacion previo para datos NO sensibles
 * hasta que se implemente AES-GCM para datos que requieran recuperacion.
 */
const SECRET_KEY = "F1n4nc3_App_S3cur1ty_K3y";

export const encryptData = (data) => {
  if (!data) return data;
  const textToChars = text => text.split('').map(c => c.charCodeAt(0));
  const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = code => textToChars(SECRET_KEY).reduce((a,b) => a ^ b, code);

  return data.split('')
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join('');
};

export const decryptData = (encoded) => {
  if (!encoded) return encoded;
  const textToChars = text => text.split('').map(c => c.charCodeAt(0));
  const applySaltToChar = code => textToChars(SECRET_KEY).reduce((a,b) => a ^ b, code);
  
  return encoded.match(/.{1,2}/g)
    .map(hex => parseInt(hex, 16))
    .map(applySaltToChar)
    .map(charCode => String.fromCharCode(charCode))
    .join('');
};
