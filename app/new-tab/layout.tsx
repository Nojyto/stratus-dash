export default function NewTabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center">
        <div className="w-full flex-1">{children}</div>
      </div>
    </main>
  )
}
