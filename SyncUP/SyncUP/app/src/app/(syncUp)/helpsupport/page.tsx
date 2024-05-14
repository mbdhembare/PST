"use client"

/* eslint-disable import/extensions,import/no-unresolved */
import React from "react"
import { useRouter } from "next/navigation"
import HelpSupport from "@/src/components/HelpAndSupport/HelpSupport"

function Page() {
  const router = typeof window !== "undefined" ? useRouter() : null
  const handleLinkClick = (itemTitle: string | number | boolean) => {
    router.push(
      `/detailedinformation?itemTitle=${encodeURIComponent(itemTitle)}`,
    )
  }

  return (
    <div>
      <HelpSupport handleLinkClick={handleLinkClick} />
    </div>
  )
}

export default Page
