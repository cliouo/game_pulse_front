const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const isNumericSegment = (segment: string) => /^\d+$/.test(segment)

export const getValueAtPath = (value: unknown, path: string) => {
  if (!path) {
    return value
  }
  const segments = path.split(".").filter(Boolean)
  let current: unknown = value
  for (const segment of segments) {
    if (current == null || (typeof current !== "object" && !Array.isArray(current))) {
      return undefined
    }
    const key = isNumericSegment(segment) ? Number(segment) : segment
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

const valuesEqual = (left: unknown, right: unknown) => {
  if (Object.is(left, right)) {
    return true
  }
  if (typeof left === "object" && typeof right === "object") {
    try {
      return JSON.stringify(left) === JSON.stringify(right)
    } catch {
      return false
    }
  }
  return false
}

const matchesContains = (actual: unknown, expected: unknown) => {
  if (!Array.isArray(actual)) {
    return false
  }
  return actual.some((item) => valuesEqual(item, expected))
}

const evaluateObject = (
  dependsOn: Record<string, unknown>,
  formValue: Record<string, unknown>,
  visited: Set<Record<string, unknown>>
) => {
  if (visited.has(dependsOn)) {
    return true
  }
  visited.add(dependsOn)
  for (const [path, expected] of Object.entries(dependsOn)) {
    const actual = getValueAtPath(formValue, path)
    if (isPlainObject(expected) && "$contains" in expected) {
      const containsValue = (expected as { $contains?: unknown }).$contains
      if (!matchesContains(actual, containsValue)) {
        visited.delete(dependsOn)
        return false
      }
      continue
    }
    if (isPlainObject(expected) && isPlainObject(actual)) {
      if (!evaluateObject(expected, actual, visited)) {
        visited.delete(dependsOn)
        return false
      }
      continue
    }
    if (!valuesEqual(actual, expected)) {
      visited.delete(dependsOn)
      return false
    }
  }
  visited.delete(dependsOn)
  return true
}

export const evaluateDependsOn = (
  dependsOn: Record<string, unknown> | undefined,
  formValue: Record<string, unknown>
) => {
  if (!dependsOn || typeof dependsOn !== "object") {
    return true
  }
  return evaluateObject(dependsOn, formValue, new Set())
}
