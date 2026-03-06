import {
  createCompletionUsage,
  isCompletionUsage,
  addCompletionUsage,
  addCompletionUsageFromPayload,
} from "../../src/testing-tools/utils.js";

describe("testing-tools usage utils", () => {
  test("createCompletionUsage returns zeroed token usage", () => {
    expect(createCompletionUsage()).toEqual({
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    });
  });

  test("isCompletionUsage validates required top-level numeric token fields", () => {
    expect(isCompletionUsage(null)).toBe(false);
    expect(isCompletionUsage({})).toBe(false);
    expect(
      isCompletionUsage({
        prompt_tokens: 1,
        completion_tokens: 2,
        total_tokens: 3,
      })
    ).toBe(true);
  });

  test("addCompletionUsage and addCompletionUsageFromPayload aggregate totals and details", () => {
    const total = createCompletionUsage();

    expect(
      addCompletionUsage(total, {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
        completion_tokens_details: {
          accepted_prediction_tokens: 1,
          audio_tokens: 2,
          reasoning_tokens: 3,
          rejected_prediction_tokens: 4,
        },
        prompt_tokens_details: {
          audio_tokens: 5,
          cached_tokens: 6,
        },
      })
    ).toBe(true);

    expect(
      addCompletionUsageFromPayload(total, {
        usage: {
          prompt_tokens: 1,
          completion_tokens: 2,
          total_tokens: 3,
          completion_tokens_details: {
            accepted_prediction_tokens: 10,
          },
          prompt_tokens_details: {
            cached_tokens: 7,
          },
        },
      })
    ).toBe(true);

    expect(addCompletionUsage(total, { nope: true })).toBe(false);

    expect(total).toEqual({
      prompt_tokens: 11,
      completion_tokens: 22,
      total_tokens: 33,
      completion_tokens_details: {
        accepted_prediction_tokens: 11,
        audio_tokens: 2,
        reasoning_tokens: 3,
        rejected_prediction_tokens: 4,
      },
      prompt_tokens_details: {
        audio_tokens: 5,
        cached_tokens: 13,
      },
    });
  });
});
