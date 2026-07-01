export function logVariant(experimentKey: string, variant: "A" | "B", event: string): void {
  console.log(`[AB] experiment="${experimentKey}" variant="${variant}" event="${event}"`);
}
