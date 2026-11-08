import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSettings, storeMode } from "@/lib/store";
import { AdminApp } from "@/components/admin/admin-app";

export const metadata: Metadata = { title: "Admin — Shiv Shringar", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  await getSettings(); // warms the DB connection so the badge is accurate
  return <AdminApp mode={storeMode()} />;
}
