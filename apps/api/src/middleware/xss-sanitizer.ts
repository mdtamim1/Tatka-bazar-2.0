// =============================================================================
// Tatka Bazar — Global XSS (Cross-Site Scripting) Sanitization Engine
// Strips malicious <script>, <iframe>, javascript: protocols, and event handlers
// =============================================================================

import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Clean dangerous HTML tags, javascript: uris, and on* event handlers from string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;

  return input
    // Remove <script> ... </script> tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove <iframe>, <object>, <embed>, <applet>, <form>, <base>
    .replace(/<\/?(iframe|object|embed|applet|form|base|meta|link)[^>]*>/gi, "")
    // Remove inline event handlers (e.g. onerror=, onclick=, onload=, onmouseover=)
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
    // Remove javascript: and vbscript: URIs
    .replace(/javascript\s*:[^"'>]*/gi, "")
    .replace(/vbscript\s*:[^"'>]*/gi, "")
    // Remove data:text/html URIs
    .replace(/data\s*:\s*text\/html[^"'>]*/gi, "")
    .trim();
}

/**
 * Recursively sanitize objects, arrays, and primitive strings
 */
export function deepSanitize(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => deepSanitize(item));
  }

  if (typeof data === "object") {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = deepSanitize(value);
    }
    return sanitizedObj;
  }

  return data;
}

/**
 * Fastify global preValidation hook for XSS Sanitization
 */
export async function xssSanitizerHook(request: FastifyRequest, _reply: FastifyReply) {
  if (request.body && typeof request.body === "object") {
    request.body = deepSanitize(request.body);
  }
  if (request.query && typeof request.query === "object") {
    request.query = deepSanitize(request.query) as any;
  }
  if (request.params && typeof request.params === "object") {
    request.params = deepSanitize(request.params) as any;
  }
}
