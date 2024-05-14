/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react"
import {
  Box,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import PendingIcon from "@mui/icons-material/Pending"

function CategoryOptions() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [nestedAnchorEl, setNestedAnchorEl] = useState(null)

  const handleIconClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setNestedAnchorEl(null)
  }

  const handleMoveListOpen = (event) => {
    setNestedAnchorEl(event.currentTarget)
  }

  const handleMoveListClose = () => {
    setNestedAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const nestedOpen = Boolean(nestedAnchorEl)

  return (
    <>
      <Box
        id="dropdownNavbarLink"
        className="cursor-pointer font-bold hover:text-white"
        onClick={handleIconClick}
      >
        <PendingIcon />
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box>
          <List className="w-max h-max p-0 text-xs">
            <ListItem
              className="hover:bg-purple-300 hover:text-white text-start cursor-pointer"
              onClick={handleMoveListOpen}
            >
              Demo List <ArrowRightIcon />
            </ListItem>

            <ListItem className="hover:bg-purple-300 hover:text-white text-start cursor-pointer">
              Delete Board
            </ListItem>
          </List>
        </Box>
      </Popover>
      <Popover
        open={nestedOpen}
        anchorEl={nestedAnchorEl}
        onClose={handleMoveListClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <List className="w-max h-max p-0 text-xs">
          <ListItem className="hover:bg-purple-300 hover:text-white text-start cursor-pointer">
            List Item
          </ListItem>
          <ListItem className="hover:bg-purple-300 hover:text-white text-start cursor-pointer">
            List Item
          </ListItem>
          <ListItem className="hover:bg-purple-300 hover:text-white text-start cursor-pointer">
            List Item
          </ListItem>
        </List>
      </Popover>
    </>
  )
}
export default CategoryOptions
