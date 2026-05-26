const publicFirebaseKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

type PublicFirebaseKey = (typeof publicFirebaseKeys)[number];

type PublicFirebaseEnv = Record<PublicFirebaseKey, string>;

function hasPlaceholderValue(value: string) {
  const normalised = value.trim().toLowerCase();
  return (
    normalised === "demo-api-key" ||
    normalised === "demo.firebaseapp.com" ||
    normalised === "onyx-command-centre-demo" ||
    normalised === "onyx-command-centre-demo.appspot.com" ||
    normalised === "000000000000" ||
    normalised === "1:000000000000:web:demo" ||
    normalised.startsWith("your-") ||
    normalised.includes("your-project")
  );
}

const buildSafeFirebaseFallback: PublicFirebaseEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "onyx-command-centre-demo",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "onyx-command-centre-demo.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "000000000000",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:000000000000:web:demo",
};

function readPublicFirebaseEnv(): PublicFirebaseEnv {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

function isMissingValue(value: string) {
  return value.trim().length === 0;
}

function getFirebaseEnvMessage(missingKeys: PublicFirebaseKey[], placeholderKeys: PublicFirebaseKey[]) {
  if (!missingKeys.length && !placeholderKeys.length) return null;

  const details = [
    missingKeys.length ? `missing: ${missingKeys.join(", ")}` : null,
    placeholderKeys.length ? `placeholder values: ${placeholderKeys.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  return `Firebase environment variables are missing or still using placeholder values. Configure the six NEXT_PUBLIC Firebase keys in Vercel or your local env (${details}).`;
}

function getPublicFirebaseEnv(): PublicFirebaseEnv {
  const rawEnv = readPublicFirebaseEnv();

  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: isMissingValue(rawEnv.NEXT_PUBLIC_FIREBASE_API_KEY)
      ? buildSafeFirebaseFallback.NEXT_PUBLIC_FIREBASE_API_KEY
      : rawEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: isMissingValue(rawEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
      ? buildSafeFirebaseFallback.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      : rawEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: isMissingValue(rawEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
      ? buildSafeFirebaseFallback.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      : rawEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: isMissingValue(rawEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
      ? buildSafeFirebaseFallback.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      : rawEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: isMissingValue(rawEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
      ? buildSafeFirebaseFallback.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      : rawEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: isMissingValue(rawEnv.NEXT_PUBLIC_FIREBASE_APP_ID)
      ? buildSafeFirebaseFallback.NEXT_PUBLIC_FIREBASE_APP_ID
      : rawEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export interface FirebaseEnvStatus {
  isConfigured: boolean;
  usesPlaceholders: boolean;
  missingKeys: PublicFirebaseKey[];
  placeholderKeys: PublicFirebaseKey[];
  message: string | null;
}

export const publicFirebaseEnv = getPublicFirebaseEnv();

export function getFirebaseEnvStatus(): FirebaseEnvStatus {
  const env = getPublicFirebaseEnv();
  const missingKeys = publicFirebaseKeys.filter((key) => isMissingValue(env[key]));
  const placeholderKeys = publicFirebaseKeys.filter((key) => !isMissingValue(env[key]) && hasPlaceholderValue(env[key]));
  const isConfigured = missingKeys.length === 0 && placeholderKeys.length === 0;

  return {
    isConfigured,
    usesPlaceholders: placeholderKeys.length > 0,
    missingKeys,
    placeholderKeys,
    message: getFirebaseEnvMessage(missingKeys, placeholderKeys),
  };
}

export const firebaseEnvStatus = getFirebaseEnvStatus();

export function assertFirebaseClientEnvReady() {
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") return;

  const status = getFirebaseEnvStatus();
  if (!status.isConfigured) {
    throw new Error(status.message ?? "Firebase environment variables are not configured.");
  }
}
