/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/extensions,import/no-unresolved */
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "@/src/components/Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SyncUP",
  description: "Generated by create next app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
