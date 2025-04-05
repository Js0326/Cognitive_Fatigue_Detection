import { ProtectedLayout } from "@/components/protected-layout"

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}