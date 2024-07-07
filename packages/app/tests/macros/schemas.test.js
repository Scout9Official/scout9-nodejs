import { z } from "zod";
import { ContextExampleSchema } from '../../src/macros/schemas.js';

// Example function to parse and validate data
const validateCaptureContextRequestExamples = (data) => {
  try {
    ContextExampleSchema.parse(data);
    return "Validation succeeded!";
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new Error(`Validation Error: ${JSON.stringify(e.errors, null, 2)}`);
    } else {
      throw e;
    }
  }
};

describe("ContextExampleSchema", () => {
  test("should succeed for valid data", () => {
    const validData = [
      {
        input: "example input",
        output: [{ key: "value" }]
      }
    ];

    expect(() => validateCaptureContextRequestExamples(validData)).not.toThrow();
    expect(validateCaptureContextRequestExamples(validData)).toBe("Validation succeeded!");
  });

  test("should fail for invalid data and return correct error format", () => {
    const invalidData = [
      {
        input: 123, // invalid type for 'input'
        output: [{ key: "value" }]
      }
    ];

    try {
      validateCaptureContextRequestExamples(invalidData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/Validation Error:/);
      expect(error.message).toMatch(/"input"/);
      expect(error.message).toMatch(/"expected": "string"/);
    }
  });
});
