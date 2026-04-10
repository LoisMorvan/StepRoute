// stride length ≈ height × 0.413 (biomechanics standard)
export function heightToStrideLength(heightCm: number): number {
  return (heightCm / 100) * 0.413;
}

export function stepsToMeters(steps: number, strideLength = 0.75): number {
  return steps * strideLength;
}

export function metersToSteps(meters: number, strideLength = 0.75): number {
  return Math.round(meters / strideLength);
}
