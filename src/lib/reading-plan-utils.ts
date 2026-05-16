/** Normalize grade keys from reading plan (e.g. "1-4º Ano" → "1-4"). */
export function normalizeGradeKey(grade: string | number): string {
  const g = String(grade).trim().toLowerCase();
  if (g === "1st-4th" || g.startsWith("1-4")) return "1-4";
  if (g === "5th-9th" || g.startsWith("5-9")) return "5-9";
  if (g === "10th-12th" || g.startsWith("10-12")) return "10-12";
  if (g === "didactic_aids" || g === "outros" || g === "others") return g;
  return String(grade).trim();
}

export function isDidacticGradeRange(grade: string): boolean {
  const lower = normalizeGradeKey(grade);
  return (
    lower === "1-4" ||
    lower === "5-9" ||
    lower === "10-12" ||
    lower === "outros" ||
    lower === "others" ||
    lower === "didactic_aids"
  );
}

export function sortGradeKeys(a: string, b: string): number {
  const getOrder = (grade: string) => {
    const lower = normalizeGradeKey(grade);
    if (lower === "iniciação" || lower === "reception") return -1;
    if (lower === "outros" || lower === "others" || lower === "didactic_aids") return 100;
    if (lower === "1-4") return 4.5;
    if (lower === "5-9") return 9.5;
    if (lower === "10-12") return 12.5;
    const num = parseInt(lower, 10);
    return Number.isNaN(num) ? 99 : num;
  };
  return getOrder(a) - getOrder(b);
}

export type ReadingPlanBucket = "mandatory" | "recommended" | "didactic_aids";

/** Where a reading-plan row belongs in the shop/school UI. */
export function resolveReadingPlanBucket(
  grade: string | number,
  status: string
): ReadingPlanBucket {
  const gradeKey = normalizeGradeKey(grade);
  if (isDidacticGradeRange(gradeKey)) return "didactic_aids";
  if (status === "mandatory") return "mandatory";
  if (status === "recommended") return "recommended";
  return "didactic_aids";
}
