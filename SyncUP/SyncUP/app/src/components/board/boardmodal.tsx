"use client"

/* eslint-disable import/extensions,import/no-unresolved ,react/jsx-key,import/no-extraneous-dependencies, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars,no-shadow,no-console,react/no-array-index-key,jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Radio,
  RadioGroup,
  Card,
  Button,
  Select,
  SelectItem,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@nextui-org/react"
import { IoAdd, IoCloseOutline } from "react-icons/io5"

import { BiSolidLock } from "react-icons/bi"
import {
  MdOutlinePublic,
  MdArrowForwardIos,
  MdArrowBackIos,
} from "react-icons/md"
import { useSession } from "next-auth/react"
import reactCSS from "reactcss"
import { SketchPicker } from "react-color"
import { createcategory } from "@/server/category"
import {
  createboard,
  getAllUsers,
  getUserByEmail,
  updateBoard,
} from "@/server/board"

const backgroundImages = [
  "/backgrounds/image1.avif",
  "/backgrounds/image2.avif",
  "/backgrounds/image3.jpg",
  "/backgrounds/image4.jpg",
  "/backgrounds/image5.jpg",
  "/backgrounds/image6.avif",
  "/backgrounds/image7.jpg",
  "/backgrounds/image8.jpg",
  "/backgrounds/image1.avif",
]
const defaultCategories = ["Backlog", "Progress", "In Review", "Done"]
const defaultColors = ["#EF4B4B", "#40A2E3", "#FFC94A", "#90D26D"]
function AddBoardModal({ open, onClose, boardData }) {
  const [boardName, setBoardName] = useState("")
  const [visibility, setVisibility] = useState("PUBLIC")
  const [error, setError] = useState("")
  const [categories, setCategories] = useState(defaultCategories)
  const [selectedBackground, setSelectedBackground] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const { data: session, status } = useSession()
  const [categoryColors, setCategoryColors] = useState(defaultColors)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(
    Array(categories.length).fill(false),
  )
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers()
        setAllUsers(users)
        if (status === "authenticated" && session && open && !boardData) {
          const userId = await getUserByEmail(session.user.email)
          setSelectedUsers([userId])
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }
    if (open) {
      fetchUsers()
    }
  }, [open])
  useEffect(() => {
    setSelectedBackground(backgroundImages[currentIndex + 1])
  }, [currentIndex, backgroundImages])
  useEffect(() => {
    if (boardData) {
      if (session && session.user) {
        setBoardName(boardData.name || "")
        setVisibility(boardData.visibility || "PUBLIC")
        setSelectedBackground(boardData.background || "")
        setCurrentIndex(
          backgroundImages.findIndex((img) => img === boardData.background) - 1,
        )
        setCategories(boardData.categories || [""])
        setSelectedUsers(boardData.users.map((user) => user.id))
      }
    }
  }, [boardData, session])
  const handleClose = () => {
    onClose()
    setError("")
    setBoardName("")
    setVisibility("PUBLIC")
    setCurrentIndex(0)
    setSelectedUsers([])
    setCategories(defaultCategories)
    setCategoryColors(defaultColors)
  }
  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1
      return nextIndex >= backgroundImages.length ? 0 : nextIndex
    })
  }
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1,
    )
  }
  const handleInputChange = (e) => {
    const { value } = e.target
    const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/
    if (specialCharacters.test(value)) {
      setError("Special characters are not allowed")
    } else {
      setBoardName(value)
      setError("")
    }
  }
  const handleUserChange = (selectedItems) => {
    const selectedKeys = Array.from(selectedItems)
    setSelectedUsers(selectedKeys)
  }
  const handleVisibilityChange = (e) => {
    setError("")
    setVisibility(e.target.value)
  }
  const handleCreateOrUpdateBoard = async () => {
    try {
      if (!boardName.trim()) {
        setError("Board name cannot be empty")
        return
      }
      if (boardData) {
        const previousUserIds = boardData.users.map((user) => user.id)
        const usersToUnassign = previousUserIds.filter(
          (id) => !selectedUsers.includes(id.toString()),
        )
        const usersToAssign = selectedUsers.filter(
          (id) => !previousUserIds.includes(id),
        )
        await updateBoard(
          boardData.id,
          boardName,
          selectedBackground,
          visibility,
          usersToAssign.map((id) => ({ id })),
          usersToUnassign.map((id) => ({ id })),
          selectedUsers
        )
        setBoardName("")
        setVisibility("PUBLIC")
        setCategories([""])
        setCategoryColors([""])
        setSelectedUsers([])
      } else if (boardName !== "") {
        const boardId = await createboard(
          boardName,
          visibility,
          selectedBackground,
          selectedUsers,
        )
        const nonEmptyCategories = categories.filter(
          (category) => category.trim() !== "",
        )
        await Promise.all(
          nonEmptyCategories.map(async (category, index) => {
            const color = categoryColors[index % categoryColors.length]
            await createcategory(category, boardId, color)
          }),
        )
      }
      setBoardName("")
      setVisibility("PUBLIC")
      setCategories([""])
      setCategoryColors([""])
      setSelectedUsers([])
      if (boardName !== "") {
        handleClose()
      }
    } catch (error) {
      console.error("Error creating/updating board:", error)
    }
  }
  const handleAddCategory = () => {
    setCategories([...categories, ""])
    setCategoryColors([...categoryColors, "#8e78b6"])
    setCategoryPickerOpen([...categoryPickerOpen, false])
  }
  const handleDeleteCategory = (index) => {
    const updatedCategories = [...categories]
    updatedCategories.splice(index, 1)
    setCategories(updatedCategories)
    const updatedColors = [...categoryColors]
    updatedColors.splice(index, 1)
    setCategoryColors(updatedColors)
    const updatedPickerOpen = [...categoryPickerOpen]
    updatedPickerOpen.splice(index, 1)
    setCategoryPickerOpen(updatedPickerOpen)
  }
  const handleCategoryInputChange = (event, index) => {
    const updatedCategories = [...categories]
    updatedCategories[index] = event.target.value
    setCategories(updatedCategories)
  }

  const handleSwatchClick = (index) => {
    const updatedPickerOpen = [...categoryPickerOpen]
    updatedPickerOpen[index] = !updatedPickerOpen[index]
    setCategoryPickerOpen(updatedPickerOpen)
  }

  const handlePickerClose = (index) => {
    const updatedPickerOpen = [...categoryPickerOpen]
    updatedPickerOpen[index] = false
    setCategoryPickerOpen(updatedPickerOpen)
  }

  const handleCategoryColorChange = (index, newColor) => {
    const updatedColors = [...categoryColors]
    updatedColors[index] = newColor.hex
    setCategoryColors(updatedColors)
  }

  const getCategoryStyles = (categoryColor) =>
    reactCSS({
      default: {
        color: {
          width: "36px",
          height: "14px",
          borderRadius: "2px",
          background: categoryColor || "#8e78b6",
        },
        swatch: {
          padding: "5px",
          background: "#fff",
          borderRadius: "1px",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
          display: "inline-block",
          cursor: "pointer",
        },
        popover: {
          position: "absolute",
          zIndex: "2",
          top: "25px",
          right: "0",
        },
        cover: {
          position: "fixed",
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px",
        },
      },
    })
  return (
    <Modal
      shouldBlockScroll={false}
      isOpen={open}
      onClose={handleClose}
      placement="center"
      className="p-1 max-h-[80vh] md:no-scrollbar"
    >
      <ModalContent className="overflow-y-auto md:max-h-500 no-scrollbar">
        <ModalHeader>{boardData ? "Update Board" : "Create Board"}</ModalHeader>
        <ModalBody>
          <Input
            label="BoardName"
            size="sm"
            value={boardName}
            onChange={handleInputChange}
            errorMessage={error}
          />
          <RadioGroup
            label="Visiblity"
            color="secondary"
            orientation="horizontal"
            value={visibility}
            onChange={handleVisibilityChange}
          >
            <Radio value="PUBLIC">
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <MdOutlinePublic size={20} />
                Public
              </span>
            </Radio>
            <Radio value="PRIVATE">
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <BiSolidLock size={20} />
                Private
              </span>
            </Radio>
          </RadioGroup>
          {!boardData && (
            <>
              <div style={{ color: "#72727a" }}>Categories</div>
              {categories.map((category, index) => (
                <div
                  className="flex items-center"
                  key={index}
                  style={{ position: "relative" }}
                >
                  <Input
                    variant="bordered"
                    size="sm"
                    value={category}
                    onChange={(event) =>
                      handleCategoryInputChange(event, index)
                    }
                    endContent={
                      <IoCloseOutline
                        size={25}
                        onClick={() => handleDeleteCategory(index)}
                        style={{ color: "grey" }}
                      />
                    }
                  />
                  <div
                    className="ml-2"
                    style={getCategoryStyles(categoryColors[index]).swatch}
                    onClick={() => handleSwatchClick(index)}
                  >
                    <div
                      style={getCategoryStyles(categoryColors[index]).color}
                    />
                  </div>
                  {categoryPickerOpen[index] && (
                    <div
                      style={getCategoryStyles(categoryColors[index]).popover}
                    >
                      <div
                        style={getCategoryStyles(categoryColors[index]).cover}
                        onClick={() => handlePickerClose(index)}
                      />
                      <SketchPicker
                        color={categoryColors[index]}
                        onChange={(color) =>
                          handleCategoryColorChange(index, color)
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
              <Button
                className="w-9"
                variant="flat"
                color="secondary"
                onClick={handleAddCategory}
              >
                <IoAdd size={25} />
              </Button>
            </>
          )}

          {visibility === "PRIVATE" && (
            <div>
              <label>Select users</label>
              <Select
                className="w-full "
                color="secondary"
                placeholder="Select users"
                aria-label="select"
                items={allUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user.id)
                  return {
                    key: user.id.toString(),
                    ...user,
                    selected: isSelected,
                    value: user.id,
                  }
                })}
                selectionMode="multiple"
                selectedKeys={selectedUsers.map((user) => user.toString())}
                onSelectionChange={handleUserChange}
                variant="bordered"
                size="sm"
                classNames={{
                  label: "group-data-[filled=true]:-translate-y-5",
                  trigger: "min-h-unit-16",
                  listboxWrapper: "max-h-[200px] overflow-y-auto",
                }}
                style={{ border: "none" }}
                renderValue={(items) => {
                  return (
                    <div className="flex flex-wrap gap-2 p-4">
                      <AvatarGroup
                        size="sm"
                        className="justify-start"
                        isBordered
                        max={2}
                      >
                        {items.map((item) => (
                          <Tooltip
                            placement="bottom"
                            showArrow
                            size="sm"
                            content={item.textValue}
                          >
                            <Avatar
                              size="sm"
                              name={item.textValue.substring(0, 1)}
                            />
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    </div>
                  )
                }}
              >
                {allUsers.map((user) => (
                  <SelectItem
                    className="max-h-32 overflow-auto no-scrollbar"
                    value={user.value}
                    key={user.id}
                    textValue={user.name}
                  >
                    <div className="flex-column">
                      <div className="flex gap-2 items-center">
                        <Avatar
                          name={user.name.substring(0, 1)}
                          className="flex-shrink-0 text-lg"
                          size="sm"
                        />
                        <div className="flex flex-col">
                          <span className="text-small">{user.name}</span>
                          <span className="text-default-500 text-tiny">
                            ({user.email})
                          </span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
          <div
            style={{
              color: "#72727a",
            }}
          >
            Background
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              height: "100px",
              perspective: "1000px",
            }}
          >
            {backgroundImages
              .slice(currentIndex, currentIndex + 3)
              .map((bg, index) => (
                <Card
                  key={index}
                  style={{
                    width: "30%",
                    cursor: "pointer",
                    borderRadius: "4px",
                    overflow: "hidden",
                    position: "absolute",
                    left: `calc(25% - 17% + ${index * (25 + 2)}%)`,
                    transition: "transform 0.5s ease-in-out",
                    height: "80px",
                    transform:
                      index === 1 ? "translateZ(140px)" : "translateZ(0)",
                    zIndex: index === 1 ? 1 : 0,
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            <Button
              color="secondary"
              onClick={handlePrev}
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                marginLeft: "20px",
                transform: "translateY(-50%)",
                zIndex: "2",
                background: "none",
                boxShadow: "none",
              }}
            >
              <MdArrowBackIos size={25} />
            </Button>
            <Button
              color="secondary"
              onClick={handleNext}
              style={{
                position: "absolute",
                top: "50%",
                marginRight: "16px",
                right: "0",
                transform: "translateY(-50%)",
                zIndex: "2",
                background: "none",
                boxShadow: "none",
              }}
            >
              <MdArrowForwardIos size={25} />
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <Button variant="flat" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="flat"
              color="secondary"
              onClick={handleCreateOrUpdateBoard}
            >
              {boardData ? "Update" : "Create"}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
export default AddBoardModal
