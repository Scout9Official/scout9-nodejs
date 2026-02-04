import moment from "moment";
import { 
    parseTimeUtc,
  nextMonotonicIso,
  pushMessage,
  enforceMonotonicInPlace,
} from '../../src/testing-tools/message-utils.js';

describe("message-time.utils", () => {
  beforeAll(() => {
    moment.suppressDeprecationWarnings = true;
  });

  describe("parseTimeUtc", () => {
    test("parses valid ISO string to UTC moment", () => {
      const m = parseTimeUtc("2026-02-03T20:00:00.000Z");
      expect(m).not.toBeNull();
      expect(m.isValid()).toBe(true);
      expect(m.toISOString()).toBe("2026-02-03T20:00:00.000Z");
    });

    test("returns null for invalid string", () => {
      expect(parseTimeUtc("not-a-date")).toBeNull();
    });

    test("parses Date instance", () => {
      const d = new Date("2026-02-03T20:00:00.000Z");
      const m = parseTimeUtc(d);
      expect(m).not.toBeNull();
      expect(m.toISOString()).toBe("2026-02-03T20:00:00.000Z");
    });

    test("parses Firestore Timestamp-like object with toDate()", () => {
      const tsLike = { toDate: () => new Date("2026-02-03T20:00:00.000Z") };
      const m = parseTimeUtc(tsLike);
      expect(m).not.toBeNull();
      expect(m.toISOString()).toBe("2026-02-03T20:00:00.000Z");
    });

    test("returns null for unsupported types", () => {
      expect(parseTimeUtc(123)).toBeNull();
      expect(parseTimeUtc({})).toBeNull();
      expect(parseTimeUtc(() => {})).toBeNull();
    });
  });

  describe("nextMonotonicIso", () => {
    test("returns proposed time when no existing messages", () => {
      const existing = [];
      const out = nextMonotonicIso(existing, "2026-02-03T20:00:00.000Z");
      expect(out).toBe("2026-02-03T20:00:00.000Z");
    });

    test("bumps time to at least max(existing)+1s when proposed is earlier", () => {
      const existing = [{ time: "2026-02-03T20:00:00.000Z" }];
      const proposed = "2026-02-03T19:59:59.000Z";

      const out = nextMonotonicIso(existing, proposed, 1);
      expect(out).toBe("2026-02-03T20:00:01.000Z");
    });

    test("keeps proposed time if it is already >= max(existing)+1s", () => {
      const existing = [{ time: "2026-02-03T20:00:00.000Z" }];
      const proposed = "2026-02-03T20:00:10.000Z";

      const out = nextMonotonicIso(existing, proposed, 1);
      expect(out).toBe("2026-02-03T20:00:10.000Z");
    });

    test("uses now if proposed time is invalid, then still enforces monotonic floor", () => {
      const existing = [{ time: "2026-02-03T20:00:00.000Z" }];

      const out = nextMonotonicIso(existing, "not-a-date", 1);

      const floor = moment.utc("2026-02-03T20:00:01.000Z");
      expect(moment.utc(out).isSameOrAfter(floor)).toBe(true);
    });

    test("respects minStepSeconds other than 1", () => {
      const existing = [{ time: "2026-02-03T20:00:00.000Z" }];

      const out = nextMonotonicIso(existing, "2026-02-03T19:00:00.000Z", 5);
      expect(out).toBe("2026-02-03T20:00:05.000Z");
    });

    test("ignores invalid existing times when determining max", () => {
      const existing = [
        { time: "not-a-date" },
        { time: "2026-02-03T20:00:00.000Z" },
      ];

      const out = nextMonotonicIso(existing, "2026-02-03T19:00:00.000Z", 1);
      expect(out).toBe("2026-02-03T20:00:01.000Z");
    });
  });

  describe("pushMessage", () => {
    test("clones message (does not mutate original) and enforces time floor", () => {
      const arr = [{ time: "2026-02-03T20:00:00.000Z" }];

      const original = {
        id: "m2",
        role: "system",
        content: "hello",
        time: "2026-02-03T19:00:00.000Z",
      };

      const appended = pushMessage(arr, original);

      // original unchanged
      expect(original.time).toBe("2026-02-03T19:00:00.000Z");

      // appended corrected
      expect(appended.time).toBe("2026-02-03T20:00:01.000Z");

      // appended actually pushed
      expect(arr[arr.length - 1]).toEqual(appended);
      expect(arr).toHaveLength(2);
    });

    test("keeps a proposed future time as-is", () => {
      const arr = [{ time: "2026-02-03T20:00:00.000Z" }];

      const appended = pushMessage(arr, {
        id: "m2",
        role: "system",
        content: "future",
        time: "2026-02-03T20:00:10.000Z",
      });

      expect(appended.time).toBe("2026-02-03T20:00:10.000Z");
    });

    test("supports minStepSeconds option", () => {
      const arr = [{ time: "2026-02-03T20:00:00.000Z" }];

      const appended = pushMessage(
        arr,
        {
          id: "m2",
          role: "system",
          content: "bump",
          time: "2026-02-03T19:00:00.000Z",
        },
        { minStepSeconds: 3 }
      );

      expect(appended.time).toBe("2026-02-03T20:00:03.000Z");
    });
  });

  describe("enforceMonotonicInPlace", () => {
    test("makes times strictly increasing by minStepSeconds in the existing order", () => {
      const arr = [
        { id: "a", role: "system", content: "a", time: "2026-02-03T20:00:00.000Z" },
        { id: "b", role: "system", content: "b", time: "2026-02-03T20:00:00.000Z" }, // same
        { id: "c", role: "system", content: "c", time: "2026-02-03T19:00:00.000Z" }, // backwards
      ];

      enforceMonotonicInPlace(arr, 1);

      expect(arr[0].time).toBe("2026-02-03T20:00:00.000Z");
      expect(arr[1].time).toBe("2026-02-03T20:00:01.000Z");
      expect(arr[2].time).toBe("2026-02-03T20:00:02.000Z");
    });

    test("fills missing/invalid times with now, but still enforces monotonic", () => {
      const arr = [
        { id: "a", role: "system", content: "a", time: "2026-02-03T20:00:00.000Z" },
        { id: "b", role: "system", content: "b" }, // missing
        { id: "c", role: "system", content: "c", time: "not-a-date" }, // invalid
      ];

      enforceMonotonicInPlace(arr, 1);

      expect(moment.utc(arr[1].time).isSameOrAfter(moment.utc("2026-02-03T20:00:01.000Z"))).toBe(true);
      expect(moment.utc(arr[2].time).isAfter(moment.utc(arr[1].time))).toBe(true);
    });

    test("respects custom minStepSeconds", () => {
      const arr = [
        { id: "a", role: "system", content: "a", time: "2026-02-03T20:00:00.000Z" },
        { id: "b", role: "system", content: "b", time: "2026-02-03T20:00:00.000Z" },
      ];

      enforceMonotonicInPlace(arr, 5);
      expect(arr[1].time).toBe("2026-02-03T20:00:05.000Z");
    });
  });
});