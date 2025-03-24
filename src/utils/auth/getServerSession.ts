import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get the authenticated session on the server side
 * @returns The authenticated session or null if not authenticated
 */
export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions);
} 