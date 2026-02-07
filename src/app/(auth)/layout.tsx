import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/ejo-logo.svg"
            alt="EJO"
            width={200}
            height={80}
            className="mb-3 h-16 w-auto"
            priority
          />
          <p className="text-gray-600">Verwaltungstool für die Jugendorganisation</p>
        </div>
        {children}
      </div>
    </div>
  )
}
