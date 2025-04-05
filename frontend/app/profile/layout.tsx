import { ProtectedLayout } from "@/components/protected-layout"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}