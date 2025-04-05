import { ProtectedLayout } from "@/components/protected-layout"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}