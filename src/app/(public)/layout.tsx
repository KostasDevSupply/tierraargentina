export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Aquí irá el Navbar público en la siguiente fase */}
      <main>{children}</main>
    </div>
  )
}
