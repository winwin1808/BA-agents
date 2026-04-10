import { hasAdminSecretsEncryptionKey } from "@/lib/env";
import {
  createProviderApiKey,
  disableActiveProviderApiKeys,
  getActiveProviderApiKey,
  getLatestProviderApiKey,
} from "@/lib/db/provider-keys";
import {
  decryptAdminSecret,
  encryptAdminSecret,
  maskSecret,
} from "@/lib/security/admin-secrets";

export type OpenAiKeyMetadata = {
  configured: boolean;
  status: "unconfigured" | "active" | "disabled" | "invalid";
  label: string | null;
  modelName: string | null;
  maskedPreview: string | null;
  validationError: string | null;
  lastValidatedAt: string | null;
  updatedAt: string | null;
};

type GeminiResponsesCreateInput = {
  model: string;
  instructions?: string | null;
  input?: string;
  max_output_tokens?: number | null;
  text?: {
    verbosity?: "low" | "medium" | "high" | null;
  } | null;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export function normalizeGeminiModelName(modelName: string) {
  const trimmed = modelName.trim();
  if (!trimmed) {
    throw new Error("Model name is required.");
  }

  return trimmed.startsWith("models/") ? trimmed : `models/${trimmed}`;
}

function buildGeminiGenerateContentUrl(modelName: string) {
  return `${GEMINI_API_BASE_URL}/${normalizeGeminiModelName(modelName)}:generateContent`;
}

export function extractGeminiOutputText(payload: GeminiGenerateResponse) {
  const text = (payload.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini response did not contain text output.");
  }

  return text;
}

async function requestGeminiText(input: {
  apiKey: string;
  modelName: string;
  instructions?: string | null;
  prompt: string;
  maxOutputTokens?: number | null;
  responseMimeType?: "text/plain" | "application/json";
}) {
  const response = await fetch(buildGeminiGenerateContentUrl(input.modelName), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": input.apiKey,
    },
    body: JSON.stringify({
      systemInstruction: input.instructions
        ? {
            parts: [{ text: input.instructions }],
          }
        : undefined,
      contents: [
        {
          role: "user",
          parts: [{ text: input.prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: input.maxOutputTokens ?? 3000,
        responseMimeType: input.responseMimeType ?? "application/json",
      },
    }),
  });

  const rawBody = await response.text();
  let parsedBody: GeminiGenerateResponse | null = null;

  try {
    parsedBody = JSON.parse(rawBody) as GeminiGenerateResponse;
  } catch {
    parsedBody = null;
  }

  if (!response.ok) {
    throw new Error(
      parsedBody?.error?.message ??
        `Gemini API request failed with status ${response.status}.`,
    );
  }

  if (!parsedBody) {
    throw new Error("Gemini API returned a non-JSON response.");
  }

  return extractGeminiOutputText(parsedBody);
}

function createOpenAiClient(apiKey: string) {
  return {
    responses: {
      create: async (input: GeminiResponsesCreateInput) => ({
        output_text: await requestGeminiText({
          apiKey,
          modelName: input.model,
          instructions: input.instructions,
          prompt: input.input ?? "",
          maxOutputTokens: input.max_output_tokens,
          responseMimeType: "application/json",
        }),
      }),
    },
  };
}

export async function validateOpenAiApiKey(apiKey: string, modelName: string) {
  await requestGeminiText({
    apiKey,
    modelName,
    instructions: "Return plain text only.",
    prompt: "Reply with OK.",
    maxOutputTokens: 8,
    responseMimeType: "text/plain",
  });
}

export async function getOpenAiKeyMetadata(): Promise<OpenAiKeyMetadata> {
  const active = await getActiveProviderApiKey("openai");
  const latest = active ?? (await getLatestProviderApiKey("openai"));

  if (!latest) {
    return {
      configured: false,
      status: "unconfigured",
      label: null,
      modelName: null,
      maskedPreview: null,
      validationError: null,
      lastValidatedAt: null,
      updatedAt: null,
    };
  }

  const status = active
    ? "active"
    : latest.validationStatus === "invalid"
      ? "invalid"
      : "disabled";

  return {
    configured: Boolean(active),
    status,
    label: latest.label,
    modelName: latest.modelName,
    maskedPreview: latest.maskedPreview,
    validationError: latest.validationError,
    lastValidatedAt: latest.lastValidatedAt?.toISOString() ?? null,
    updatedAt: latest.updatedAt?.toISOString() ?? null,
  };
}

export async function setCurrentOpenAiApiKey(input: {
  label: string;
  modelName: string;
  apiKey: string;
  adminUserId: string;
}) {
  if (!hasAdminSecretsEncryptionKey()) {
    throw new Error("ADMIN_SECRETS_ENCRYPTION_KEY is not configured.");
  }

  const encryptedSecret = encryptAdminSecret(input.apiKey);
  const maskedPreview = maskSecret(input.apiKey);

  try {
    await validateOpenAiApiKey(input.apiKey, input.modelName);
  } catch (error) {
    await createProviderApiKey({
      provider: "openai",
      label: input.label,
      modelName: input.modelName,
      encryptedSecret,
      maskedPreview,
      status: "disabled",
      validationStatus: "invalid",
      validationError: error instanceof Error ? error.message : "Gemini API key validation failed.",
      lastValidatedAt: new Date().toISOString(),
      createdByAdminUserId: input.adminUserId,
      updatedByAdminUserId: input.adminUserId,
      deactivatedAt: new Date().toISOString(),
    });

    throw error;
  }

  await disableActiveProviderApiKeys({
    provider: "openai",
    updatedByAdminUserId: input.adminUserId,
  });

  return createProviderApiKey({
    provider: "openai",
    label: input.label,
    modelName: input.modelName,
    encryptedSecret,
    maskedPreview,
    status: "active",
    validationStatus: "valid",
    validationError: null,
    lastValidatedAt: new Date().toISOString(),
    createdByAdminUserId: input.adminUserId,
    updatedByAdminUserId: input.adminUserId,
  });
}

export async function disableCurrentOpenAiApiKey(adminUserId: string) {
  await disableActiveProviderApiKeys({
    provider: "openai",
    updatedByAdminUserId: adminUserId,
  });
}

export async function getConfiguredOpenAiClient() {
  const record = await getActiveProviderApiKey("openai");
  if (!record) {
    return null;
  }

  try {
    return {
      client: createOpenAiClient(decryptAdminSecret(record.encryptedSecret)),
      modelName: record.modelName,
    };
  } catch {
    return null;
  }
}
