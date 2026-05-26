#!/usr/bin/env node
const mode = process.argv[2] ?? "staging";

const sharedRequired = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_DEFAULT_WORKSPACE_ID",
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
  "SESSION_COOKIE_NAME",
  "SESSION_COOKIE_MAX_AGE_DAYS",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_ENVIRONMENT",
  "SENTRY_DSN",
  "SENTRY_ENVIRONMENT",
  "VERCEL_PROJECT_ID",
  "VERCEL_ORG_ID",
  "VERCEL_TOKEN",
];

const placeholderFragments = [
  "your-",
  "YOUR_",
  "demo-api-key",
  "demo.firebaseapp.com",
  "onyx-command-centre-demo",
  "000000000000",
  "1:000000000000:web:demo",
  "example",
];

function isPlaceholder(value) {
  if (!value) return true;
  const normalized = value.trim();
  return placeholderFragments.some((fragment) => normalized.includes(fragment));
}

const missing = [];
const placeholders = [];
for (const key of sharedRequired) {
  const value = process.env[key];
  if (!value) {
    missing.push(key);
    continue;
  }
  if (isPlaceholder(value)) placeholders.push(key);
}

if (mode === "production" && process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT !== "production") {
  placeholders.push("NEXT_PUBLIC_SENTRY_ENVIRONMENT should be production");
}
if (mode === "production" && process.env.SENTRY_ENVIRONMENT !== "production") {
  placeholders.push("SENTRY_ENVIRONMENT should be production");
}
if (mode === "staging" && process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT !== "staging") {
  placeholders.push("NEXT_PUBLIC_SENTRY_ENVIRONMENT should be staging");
}
if (mode === "staging" && process.env.SENTRY_ENVIRONMENT !== "staging") {
  placeholders.push("SENTRY_ENVIRONMENT should be staging");
}

if (missing.length || placeholders.length) {
  console.error(`Environment validation failed for ${mode}.`);
  if (missing.length) console.error(`Missing: ${missing.join(", ")}`);
  if (placeholders.length) console.error(`Invalid / placeholder: ${placeholders.join(", ")}`);
  process.exit(1);
}

console.log(`Environment validation passed for ${mode}.`);
