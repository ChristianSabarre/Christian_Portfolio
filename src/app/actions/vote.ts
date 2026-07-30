"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export type VoteResult = { votes: number; alreadyVoted: boolean; error?: string };

/**
 * Derives a stable but non-identifying key for the caller.
 *
 * The raw IP is never stored — only a salted SHA-256 of it plus the user agent.
 * AUTH_SECRET is the salt so the hashes are not reversible with a rainbow table
 * of the IPv4 space.
 */
async function voterKey(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
  const agent = h.get("user-agent") ?? "unknown";
  const salt = process.env.AUTH_SECRET ?? "unsalted";
  return createHash("sha256").update(`${salt}|${ip}|${agent}`).digest("hex").slice(0, 40);
}

/**
 * Public — anyone browsing can upvote. One vote per visitor per project is
 * enforced by the unique index on (projectId, voterKey), so a client that
 * ignores its local guard still cannot inflate the count.
 */
export async function upvoteProject(projectId: number): Promise<VoteResult> {
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return { votes: 0, alreadyVoted: false, error: "Invalid project" };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, published: true },
    select: { id: true },
  });
  if (!project) return { votes: 0, alreadyVoted: false, error: "Project not found" };

  const key = await voterKey();
  let alreadyVoted = false;

  try {
    await prisma.vote.create({ data: { projectId, voterKey: key } });
  } catch {
    // Unique violation — this visitor has already voted for this project.
    alreadyVoted = true;
  }

  const votes = await prisma.vote.count({ where: { projectId } });
  revalidatePath("/");
  return { votes, alreadyVoted };
}
