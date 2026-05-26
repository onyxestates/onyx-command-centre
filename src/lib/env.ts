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
    !normalised ||
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

function getPublicFirebaseEnv(): PublicFirebaseEnv {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "demo.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "onyx-command-centre-demo",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "onyx-command-centre-demo.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:000000000000:web:demo",
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
  const missingKeys = publicFirebaseKeys.filter((key) => !process.env[key]);
  const placeholderKeys = publicFirebaseKeys.filter((key) => hasPlaceholderValue(publicFirebaseEnv[key]));
  const isConfigured = missingKeys.length === 0 && placeholderKeys.length === 0;

  return {
    isConfigured,
    usesPlaceholders: placeholderKeys.length > 0,
    missingKeys,
    placeholderKeys,
    message: isConfigured
      ? null
      : "Firebase environment variables are missing or still using placeholder values. Update .env.local before using live Auth, Firestore, or Storage.",
  };
}

export const firebaseEnvStatus = getFirebaseEnvStatus();

export function assertFirebaseClientEnvReady() {
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") return;
  if (!firebaseEnvStatus.isConfigured) {
    throw new Error(firebaseEnvStatus.message ?? "Firebase environment variables are not configured.");
  }
}
