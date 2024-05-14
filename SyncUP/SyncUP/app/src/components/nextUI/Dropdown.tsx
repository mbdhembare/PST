"use client"

/* eslint-disable  react/no-unstable-nested-components */
import React, { useState } from "react"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  RadioGroup,
  Radio,
} from "@nextui-org/react"

export default function NextDropdown() {
  const [selectedColor, setSelectedColor] = useState("default")

  const variants = ["solid", "bordered", "light", "flat", "faded", "shadow"]

  function DropdownContent({ variant, color }) {
    return (
      <Dropdown>
        <DropdownTrigger>
          <Button color={color} variant={variant} className="capitalize">
            {variant}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Dropdown Variants"
          color={color}
          variant={variant}
        >
          <DropdownItem key="new">New file</DropdownItem>
          <DropdownItem key="copy">Copy link</DropdownItem>
          <DropdownItem key="edit">Edit file</DropdownItem>
          <DropdownItem key="delete" className="text-danger" color="danger">
            Delete file
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
  }

  return (
    <div className="flex flex-wrap gap-4">
      {variants.map((variant) => (
        <DropdownContent
          key={variant}
          color={selectedColor}
          variant={variant}
        />
      ))}
      <RadioGroup
        label="Select dropdown color"
        orientation="horizontal"
        color={selectedColor}
        defaultValue="default"
        onValueChange={setSelectedColor}
      >
        <Radio value="default">Default</Radio>
        <Radio value="primary">Primary</Radio>
        <Radio value="secondary">Secondary</Radio>
        <Radio value="success">Success</Radio>
        <Radio value="warning">Warning</Radio>
        <Radio value="danger">Danger</Radio>
      </RadioGroup>
    </div>
  )
}
