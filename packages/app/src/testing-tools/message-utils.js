import moment from "moment";

/**
 * @typedef {import("@scout9/admin").Message} Message
 */

/**
 * Parse a message time into a Moment (UTC).
 *
 * Accepts:
 * - ISO string
 * - Date
 * - Firestore Timestamp-ish object: { toDate(): Date }
 *
 * @param {any} t
 * @returns {import("moment").Moment|null} A UTC moment if valid; otherwise null.
 */
export function parseTimeUtc(t) {
  if (!t) return null;

  if (typeof t === "string") {
    const m = moment.utc(t);
    return m.isValid() ? m : null;
  }

  if (t instanceof Date) return moment.utc(t);

  // Firestore Timestamp-ish: { toDate(): Date }
  if (t && typeof t.toDate === "function") return moment.utc(t.toDate());

  return null;
}

/**
 * Compute a safe monotonic ISO time:
 * - uses proposed time if valid, else "now"
 * - ensures >= max(existing.time) + minStepSeconds
 *
 * @param {Message[]} existing
 * @param {any} [proposedTime]
 * @param {number} [minStepSeconds=1]
 * @returns {string} ISO string (UTC)
 */
export function nextMonotonicIso(existing, proposedTime, minStepSeconds = 1) {
  const proposed = parseTimeUtc(proposedTime) ?? moment.utc();

  /** @type {import("moment").Moment|null} */
  let max = null;

  for (const m of existing || []) {
    const mt = parseTimeUtc(m?.time);
    if (mt && (!max || mt.isAfter(max))) max = mt;
  }

  if (!max) return proposed.toISOString();

  const floor = max.clone().add(minStepSeconds, "second");
  return (proposed.isBefore(floor) ? floor : proposed).toISOString();
}

/**
 * Append a message to an array, enforcing monotonic time.
 * Returns the appended (cloned) message with corrected time.
 *
 * Note: this function clones the object before pushing (it does not mutate `msg`).
 *
 * @param {Message[]} arr
 * @param {Message} msg
 * @param {{ minStepSeconds?: number }} [opts]
 * @returns {Message}
 */
export function pushMessage(arr, msg, opts) {
  /** @type {Message} */
  const safe = /** @type {any} */ ({ ...msg });

  safe.time = nextMonotonicIso(arr, safe.time, opts?.minStepSeconds ?? 1);

  arr.push(safe);
  return safe;
}

/**
 * If the array is already in the desired order, make times strictly increasing
 * (does NOT reorder).
 *
 * @param {Message[]} arr
 * @param {number} [minStepSeconds=1]
 * @returns {void}
 */
export function enforceMonotonicInPlace(arr, minStepSeconds = 1) {
  /** @type {import("moment").Moment|null} */
  let last = null;

  for (const m of arr) {
    const mt = parseTimeUtc(m?.time) ?? moment.utc();

    if (!last) {
      m.time = mt.toISOString();
      last = mt;
      continue;
    }

    const floor = last.clone().add(minStepSeconds, "second");
    last = mt.isBefore(floor) ? floor : mt;
    m.time = last.toISOString();
  }
}