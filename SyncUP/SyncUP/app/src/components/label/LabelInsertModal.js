/* eslint-disable @typescript-eslint/no-unused-vars, import/no-extraneous-dependencies */
import React, { useState, useEffect } from "react"
import Modal from "@mui/material/Modal"
import { styled } from "@mui/system"
import { Button, Input } from "@nextui-org/react"

const colorOptions = [
  { color: "#EF9A9A", name: "PaleOrange" },
  { color: "#E1E1E1", name: "white" },
  { color: "#D3A2EB", name: "LightPurple" },
  { color: "#B39DDB", name: "Purple" },
  { color: "#9FA9DA", name: "PaleBlue" },
  { color: "#90CAF9", name: "Blue" },
  { color: "#93C0EA", name: "LightBlue" },
  { color: "#81CBC4", name: "BlueGreen" },
  { color: "#C5E2A5", name: "LightGreen" },
  { color: "#F8E0A3", name: "PaleYellow" },
  { color: "#FFAC95", name: "Cream" },
  { color: "#BCABA4", name: "LightBlue" },
  { color: "#E8DFBA", name: "Humancolor" },
]

const ColorPicker = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginBottom: "16px",
})

const ColorOption = styled("div")(({ theme, selected, color }) => ({
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  backgroundColor: color,
  cursor: "pointer",
  border: selected ? "2px solid #1976D2" : "none",
  transition: "border 0.3s ease-in-out",
}))

function LabelInsertModal({ open, onClose, onInsert, onUpdate, initialData }) {
  const [labelName, setLabelName] = useState(initialData?.name || "")
  const [selectedColor, setSelectedColor] = useState(
    initialData?.color || colorOptions[0].color,
  )

  const handleInsert = () => {
    onInsert({ name: labelName, color: selectedColor })
    onClose()
  }
  const handleUpdate = () => {
    onUpdate({ id: initialData.id, name: labelName, color: selectedColor })
    onClose()
  }
  useEffect(() => {
    setLabelName(initialData?.name || "")
    setSelectedColor(initialData?.color || colorOptions[0].color)
  }, [initialData])

  return (
    <Modal open={open} onClose={onClose}>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-400 bg-white shadow-lg p-3 rounded-lg text-center dark:bg">
        <div
          className="text-xl font-medium mb-8 dark:text-text"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          Insert Label
        </div>
        <Input
          className="dark:text-text"
          type="text"
          label="Label name"
          labelPlacement="inside"
          variant="bordered"
          color="#7754bd"
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
        />
        <div className="text-lg mb-8 mt-4 dark:text-text">Pick a color:</div>

        <ColorPicker>
          {colorOptions.map((option) => (
            <ColorOption
              key={option.color}
              onClick={() => setSelectedColor(option.color)}
              selected={selectedColor === option.color}
              color={option.color}
            />
          ))}
        </ColorPicker>
        <Button
          mt={2}
          className="text-purple-700 bg-gray-100 hover:bg-purple-700 hover:text-white cursor-pointer dark:bg-700 dark:text-black"
          onClick={initialData ? handleUpdate : handleInsert}
        >
          {initialData ? "Update Label" : "Add Label"}
        </Button>
      </div>
    </Modal>
  )
}

export default LabelInsertModal
