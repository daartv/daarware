import { headers } from "next/headers";

export type Mode = "professional" | "personal";

export async function getModeFromRequest(): Promise<Mode> {
  const h = await headers();
  const path = h.get("x-pathname") ?? "";
  return path.includes("/personal") ? "personal" : "professional";
}
