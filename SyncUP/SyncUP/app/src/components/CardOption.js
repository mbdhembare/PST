"use client"

/* eslint-disable import/extensions, no-console,no-use-before-define,react/button-has-type,jsx-a11y/anchor-is-valid,@typescript-eslint/no-unused-vars,import/no-unresolved,react/jsx-key,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Listbox,
  ListboxItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"

import { VscTriangleRight } from "react-icons/vsc"
import { SlOptions } from "react-icons/sl"

import { showAllData } from "@/server/category"
import { deleteTask } from "@/server/task"
import { useGlobalSyncupContext } from "../context/SyncUpStore"
import GetSyncupData from "../../server/GetSyncupData"

function CardOption({
  taskId,
  currentListId,
  moveCardToList,
  updateCategories,
  cardTitle,
  boardId,
  boarduser
}) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [nestedAnchorEl, setNestedAnchorEl] = useState(null)
  const [categories, setCategories] = useState([])
  const [deleteCard, setdeleteCard] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const { data, setData, setLoad, load } = useGlobalSyncupContext()
  const [nestedPopoverOpen, setNestedPopoverOpen] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const handleMoveCard = (toListId) => {
    moveCardToList(taskId, currentListId, toListId)
    handleClose()
    fetchData()
  }

  const handleDelete = async () => {
    try {
      await deleteTask(taskId,boarduser)
      setShowAlert(true)
      fetchData()
    } catch (error) {
      console.error("Error deleting card:", error)
    }
    handleClose()
    setdeleteCard(null)
  }

  const fetchData = async () => {
    try {
      const updatedData = await GetSyncupData(boardId)
      setData(updatedData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoad(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [updateCategories])

  const fetchCategories = async () => {
    try {
      const responseData = await showAllData(boardId)
      setCategories(responseData)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
    setNestedAnchorEl(null)
  }

  return (
    <>
      <Popover placement="bottom-end" style={{ zIndex: 50 }}>
        <PopoverTrigger>
          <span
            onClick={(e) => {
              e.preventDefault()
              setNestedPopoverOpen(true)
            }}
          >
            <SlOptions />
          </span>
        </PopoverTrigger>
        <PopoverContent>
          <Listbox aria-label="Listbox Variants">
            <ListboxItem
              className="text-black ml-1 py-2 dark:text-text"
              color="danger"
              key="delete"
              onPress={onOpen}
              onClick={(e) => {
                e.preventDefault()
                setdeleteCard(e.target)
              }}
            >
              Delete
            </ListboxItem>
          </Listbox>
          {nestedPopoverOpen && (
            <Popover placement="right">
              <PopoverTrigger onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  className="py-2 border-none h-fit text-black dark:text-text"
                  color="secondary"
                >
                  Move card To <VscTriangleRight />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Listbox aria-label="Nested Listbox">
                  {categories.map((category) => (
                    <ListboxItem
                      className="text-black dark:text-text"
                      color="secondary"
                      onClick={() => handleMoveCard(category.id)}
                    >
                      {category.category}
                    </ListboxItem>
                  ))}
                </Listbox>
              </PopoverContent>
            </Popover>
          )}
        </PopoverContent>
      </Popover>
      {deleteCard && (
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          style={{ zIndex: 9999 }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Delete Confirmation
                </ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to delete {cardTitle} card?</p>
                  <p>This action cannot be undone.</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="secondary" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="danger" onPress={handleDelete}>
                    Delete
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
export default CardOption

