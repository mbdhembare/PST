"use client"

/* eslint-disable  import/extensions, import/no-unresolved */
import React from "react"
import { Divider, Textarea } from "@nextui-org/react"
import NextButton from "@/src/components/nextUI/Button"
import NextAvatar from "@/src/components/nextUI/Avatar"
import NextCards from "@/src/components/nextUI/Cards"
import NextCheckbox from "@/src/components/nextUI/Checkbox"
import NextDropdown from "@/src/components/nextUI/Dropdown"

function page() {
  return (
    <div>
      <div className="m-5">
        <NextButton />
      </div>
      <div className="m-5">
        <Textarea
          label="Description"
          variant="bordered"
          placeholder="Enter your description"
          disableAnimation
          disableAutosize
          classNames={{
            base: "max-w-xs",
            input: "resize-y min-h-[40px]",
          }}
        />
      </div>
      <Divider className="my-4" />
      <div className="m-5">
        <NextAvatar />
      </div>
      <Divider className="my-4" />
      <div className="m-5 w-[300px]">
        <NextCards />
      </div>
      <Divider className="my-4" />
      <div className="m-5">
        <NextCheckbox />
      </div>
      <Divider className="my-4" />
      <div className="m-5">
        <NextDropdown />
      </div>
    </div>
  )
}

export default page
