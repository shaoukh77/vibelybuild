/**
 * Prompt Validation Utility
 * Validates user prompts before sending to AI
 */

export function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return {
      valid: false,
      error: 'Prompt is required and must be a string'
    };
  }

  const trimmed = prompt.trim();

  if (trimmed.length < 10) {
    return {
      valid: false,
      error: 'Prompt must be at least 10 characters long'
    };
  }

  if (trimmed.length > 5000) {
    return {
      valid: false,
      error: 'Prompt must not exceed 5000 characters'
    };
  }

  // Check for malicious patterns
  const suspiciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /system\s*:\s*you\s+are/i,
    /disregard\s+all\s+prior/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        error: 'Prompt contains suspicious patterns'
      };
    }
  }

  return {
    valid: true,
    prompt: trimmed
  };
}

export function sanitizePrompt(prompt) {
  return prompt
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 5000);
}
