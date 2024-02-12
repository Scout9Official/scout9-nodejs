export function normalizeGlobPattern(pattern) {
  let normalizedPattern = pattern;
  let matchFound = /\{([^,]+),?.*?\}/.test(normalizedPattern);
  let iterations = 0; // Safeguard against potential infinite loops
  const maxIterations = 100; // Set a reasonable limit based on expected complexity

  while (matchFound && iterations < maxIterations) {
    normalizedPattern = normalizedPattern.replace(/\{([^,]+),?.*?\}/, '$1');
    matchFound = /\{([^,]+),?.*?\}/.test(normalizedPattern);
    iterations++;
  }

  if (iterations >= maxIterations) {
    console.warn('Reached max iterations - pattern may be too complex or improperly formatted');
  }

  return normalizedPattern;
}

function escapeSquareBrackets(pattern) {
  // Escaping both opening and closing square brackets
  return pattern.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

export function formatGlobPattern(pattern) {
  return escapeSquareBrackets(pattern);
}



