/**
 * @returns {import('@scout9/admin').TokenUsage}
 */
export function createCompletionUsage() {
  return {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };
}

/**
 * @param {unknown} value
 * @returns {value is import('@scout9/admin').TokenUsage}
 */
export function isCompletionUsage(value) {
  if (!value || typeof value !== 'object') return false;
  const usage = /** @type {Partial<import('@scout9/admin').TokenUsage>} */ (value);
  return (
    typeof usage.prompt_tokens === 'number' &&
    typeof usage.completion_tokens === 'number' &&
    typeof usage.total_tokens === 'number'
  );
}

/**
 * @param {import('@scout9/admin').TokenUsage} total
 * @param {unknown} usage
 * @returns {boolean}
 */
export function addCompletionUsage(total, usage) {
  if (!isCompletionUsage(usage)) return false;

  total.prompt_tokens += usage.prompt_tokens;
  total.completion_tokens += usage.completion_tokens;
  total.total_tokens += usage.total_tokens;

  if (usage.completion_tokens_details) {
    if (!total.completion_tokens_details) {
      total.completion_tokens_details = {};
    }
    total.completion_tokens_details.accepted_prediction_tokens =
      (total.completion_tokens_details.accepted_prediction_tokens ?? 0) +
      (usage.completion_tokens_details.accepted_prediction_tokens ?? 0);
    total.completion_tokens_details.audio_tokens =
      (total.completion_tokens_details.audio_tokens ?? 0) +
      (usage.completion_tokens_details.audio_tokens ?? 0);
    total.completion_tokens_details.reasoning_tokens =
      (total.completion_tokens_details.reasoning_tokens ?? 0) +
      (usage.completion_tokens_details.reasoning_tokens ?? 0);
    total.completion_tokens_details.rejected_prediction_tokens =
      (total.completion_tokens_details.rejected_prediction_tokens ?? 0) +
      (usage.completion_tokens_details.rejected_prediction_tokens ?? 0);
  }

  if (usage.prompt_tokens_details) {
    if (!total.prompt_tokens_details) {
      total.prompt_tokens_details = {};
    }
    total.prompt_tokens_details.audio_tokens =
      (total.prompt_tokens_details.audio_tokens ?? 0) +
      (usage.prompt_tokens_details.audio_tokens ?? 0);
    total.prompt_tokens_details.cached_tokens =
      (total.prompt_tokens_details.cached_tokens ?? 0) +
      (usage.prompt_tokens_details.cached_tokens ?? 0);
  }

  return true;
}

/**
 * @param {import('@scout9/admin').TokenUsage} total
 * @param {unknown} payload
 * @returns {boolean}
 */
export function addCompletionUsageFromPayload(total, payload) {
  return addCompletionUsage(
    total,
    /** @type {{ usage?: unknown } | undefined} */ (payload)?.usage
  );
}
