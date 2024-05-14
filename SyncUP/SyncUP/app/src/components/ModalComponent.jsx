"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Divider,
  Button,
  Breadcrumbs,
  BreadcrumbItem,
  Avatar,
  AvatarGroup,
  Select,
  SelectItem,
  Chip,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Tooltip,
  Card,
  Textarea,
} from "@nextui-org/react";
import {
  cardData,
  cardUsers,
  updateCardTitle,
  updateInfo,
  updateUser,
  unassignUser,
  updateDates,
  checkCompleted,
} from "@/server/task";
import { assignLabelToCard, unassignLabelFromCard } from "@/server/label";
import { userList } from "@/server/user";
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore";
import { useSession } from "next-auth/react";
import {
  allComments,
  createComment,
  deleteComment,
  editComment,
} from "@/server/comment";
import { showAllData } from "@/server/category";
import { moveCardToList } from "@/server/UpdateCardOrder";
import {
  IoAddOutline,
  IoAttachOutline,
  IoClose,
  IoEyeOutline,
} from "react-icons/io5";
import {
  IoMdSend,
  IoMdPeople,
  IoMdCheckmarkCircleOutline,
} from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import {
  MdDescription,
  MdLocalOffer,
  MdLink,
  MdFormatBold,
  MdFormatItalic,
  MdInsertComment,
  MdErrorOutline,
  MdOutlineMoreHoriz,
} from "react-icons/md";
import { BiSolidCalendar } from "react-icons/bi";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import GetSyncupData from "../../server/GetSyncupData";
import { fetchBoardName } from "@/server/board";
import {
  allAttachment,
  createAttachment,
  handleDeleteAttachment,
} from "@/server/attachment";
import Loader from "@/src/components/Loader";
import { BiSolidTrashAlt } from "react-icons/bi";
import { mentionMail } from "../../server/sendMail"
import { TfiComment } from "react-icons/tfi";
export default function ModalComponent() {
  const params = useParams();
  const isVisible = true;
  const updateId = parseInt(params.cardid[0]);
  const boardId = params.id;
  const [cid, setCid] = useState("");
  const { labels, setLabels } = useGlobalSyncupContext();
  const [values, setValues] = useState(new Set([]));
  const [data, setModalData] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [isTitleEmpty, setIsTitleEmpty] = useState(false);
  const [description, setDescription] = useState();
  const [users, setUsers] = useState([]);
  const [cardLabel, setCardLabel] = useState([]);
  const [showComments, setShowComments] = useState("");
  const [comment, setComment] = useState("");
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [isBoldDescription, setIsBoldDescription] = useState(false);
  const [isItalicDescription, setIsItalicDescription] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedKeys, setSelectedKeys] = React.useState(cardLabel);
  const [editedComment, setEditedComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [categories, setCategories] = useState([]);
  const formattedCreatedAt = dayjs(data?.createdAt).format("YYYY-MM-DD");
  const formattedDueDate = dayjs(data?.dueDate).format("YYYY-MM-DD");
  const selectedUsers = values
    ? Object.values(values).map((value) => value.id)
    : [];
  const router = useRouter();
  const { setData } = useGlobalSyncupContext();
  const [boardname, setboardname] = useState("");
  const [labelFlag, setLabelFlag] = useState(false)
  const [isCommentUpdated, setisCommentUpdated] = useState(false)
  const [userFlag, setUserFlag] = useState(false)
  const [attachment, setAttachment] = useState([])
  const [flag, setFlag] = useState(false)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(false)
  const [typeError, setTypeError] = useState(false)
  const [isPoperOpen, setIsPoperOpen] = useState(false)
  const [mention, setMention] = useState([])
  const [email, setEmail] = useState([])
  const handleItalicClickDescription = () => {
    setIsItalicDescription((prevIsItalic) => !prevIsItalic);
  };
  const handleBoldClickDescription = () => {
    setIsBoldDescription((prevIsBold) => !prevIsBold);
  };
  const handleFileChange = async (event) => {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = file.name;
      if (file.type.startsWith("image/")) {
        if (file.size < 1024 * 1024) {
          setFiles(file);

          const reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = async () => {
            await createAttachment({ updateId, path: reader.result, name });
            setFlag(true);
          };
          setAlert(false);
        } else {
          setAlert(true);
        }
        setTypeError(false);
      } else {
        setTypeError(true);
      }
    }
  };
  const handleClose = () => {
    setAlert(false);
  };
  function handleDroppedFile(droppedFile) {
    if (droppedFile.type.startsWith("image/")) {
      if (droppedFile.size < 1024 * 1024) {
        const name = droppedFile.name;
        setFiles([droppedFile]);
        const reader = new FileReader();
        reader.readAsDataURL(droppedFile);


        reader.onload = async () => {
          await createAttachment({ updateId, path: reader.result, name });
          setFlag(true);
        };
        setAlert(false);
      } else {
        setAlert(true);
      }
      setTypeError(false);
    } else {
      setTypeError(true);
    }
  }
  const handleCloseError = () => {
    setTypeError(false);
  };

  useEffect(() => {
    const fetch = async () => {
      const attachment = await allAttachment({ updateId });
      setAttachment(attachment);
      fetchData()
    };
    fetch();
    setFlag(false);
  }, [updateId, flag]);
  const handleDelete = async (id) => {
    await handleDeleteAttachment({ id });
    setFlag(true);
    fetchData()
  };

  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  useEffect(() => {
    const fectchCard = async () => {
      if (updateId) {
        const data = await cardData({ updateId });
        setName(data.name);
        setDescription(data?.description);
        setIsChecked(data?.isCompleted);
        setIsBoldDescription(data?.isBold);
        setIsItalicDescription(data?.isItalic);
        setState([
          {
            startDate: new Date(data.createdAt),
            endDate: new Date(data.dueDate),
            key: "selection",
          },
        ]);
      }
    };
    fectchCard();
    const fetchCategories = async () => {
      try {
        const data = await showAllData(boardId);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
    const fetchBoards = async () => {
      const board = await fetchBoardName(params);
      setboardname(board);
    };
    fetchBoards();
  }, [updateId]);

  useEffect(() => {
    const fetchCard = async () => {
      if (updateId) {
        const data = await cardData({ updateId });
        setLoading(false);
        setModalData(data);
        setCategory(data?.task);
        setCid(category?.id);
        setCardLabel(data?.label);
        setAssignedUsers(data?.assignedUsers);
      }
    };
    fetchCard();
    setLabelFlag(false);
  }, [updateId, labelFlag]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const user = await userList();
        setUsers(user);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
    const fetchuser = async () => {
      const user = await cardUsers({ updateId });
      setValues(user);
    };
    fetchuser();
    setUserFlag(false);
    fetchData()
  }, [updateId, userFlag]);

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setSnackbarOpen(true);
    setTimeout(() => {
      setSnackbarOpen(false);
    }, 2000);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handelChange = async (e) => {
    setName(e.target.value);
    setIsTitleEmpty(e.target.value?.trim() === "");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const updatedData = await GetSyncupData(boardId);
      setData(updatedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    if (name?.trim() !== "") {
      await updateCardTitle({ updateId, name });
      setLabelFlag(true);
    }
    fetchData();
  };

  const updateCard = async () => {
    if (updateId) {
      await updateInfo({
        updateId,
        description,
        isBold: isBoldDescription,
        isItalic: isItalicDescription,
      });
    }
    fetchData();
  };

  useEffect(() => {
    const fetchComments = async () => {
      const comments = await allComments({ updateId });
      setShowComments(comments);
    };
    fetchComments();
    setisCommentUpdated(false);
  }, [updateId, isCommentUpdated]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const handleCommentChange = (e) => {
    const value = e.target.value;
    setComment(value);
    if (value.includes('@')) {
      const searchString = value.substring(value.lastIndexOf('@') + 1);
      setIsPoperOpen(true);
      if (searchString.trim() !== '') {
        const filtered = users.filter(user =>
          user.name.toLowerCase().startsWith(searchString.toLowerCase())
        );
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers(users);
      }
    } else {
      setIsPoperOpen(false);
      setFilteredUsers(users);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditedComment(comment.description);
  };
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment({ commentId });
      setisCommentUpdated(true);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditedComment("");
  };

  const handleSaveEdit = async (commentId) => {
    if (editedComment?.trim() !== "") {
      await editComment({ description: editedComment, commentId });
      setEditingComment(null);
      setEditedComment("");
      setisCommentUpdated(true);
    }
  };

  const handleComment = async () => {
    if (comment?.trim() !== "") {
      await createComment({ updateId, comment, userEmail });
      const link = window.location.href;
      if (email.length > 0) {
        mentionMail({ email, link, title: data.name })
      }
      setEmail([]);
      setMention([]);
      setComment("");
      setisCommentUpdated(true);
    }
    fetchData();
  };
  const handleMoveCard = (toListId) => {
    moveCardToList(updateId, cid, toListId);
    setLabelFlag(true);
    fetchData();
  };
  const handleSelectionChange = async (selectedLabels, updateId) => {
    try {
      const currentLabels = Array.from(selectedKeys);
      const newlySelectedLabels = Array.from(selectedLabels);
      const labelsToUnassign = currentLabels.filter(
        (labelId) => !newlySelectedLabels.includes(labelId)
      );
      for (const labelId of labelsToUnassign) {
        await unassignLabelFromCard(updateId, labelId);
        setLabelFlag(true);
      }
      for (const labelId of newlySelectedLabels) {
        await assignLabelToCard(updateId, labelId);
        setLabelFlag(true);
      }
      setSelectedKeys(new Set(newlySelectedLabels));
    } catch (error) {
      console.error("Error toggling labels:", error);
    }
    fetchData();
  };

  const setUserId = async (selectedItems) => {
    const selectedKeys = Array.from(selectedItems);
    const selectedUserIds = selectedKeys
      .map((key) => parseInt(key))
      .filter((id) => !isNaN(id));
    const previouslySelectedUserIds = values.map((user) => user.id);
    const newlySelectedUserIds = selectedUserIds.filter(
      (id) => !previouslySelectedUserIds.includes(id)
    );
    const deselectedUserIds = previouslySelectedUserIds.filter(
      (id) => !selectedUserIds.includes(id)
    );

    if (newlySelectedUserIds.length > 0) {
      await updateUser({
        selectedUserId: newlySelectedUserIds,
        updateId,
      });
      setUserFlag(true);
    }

    if (deselectedUserIds.length > 0) {
      deselectedUserIds.forEach((userId) => {
        unassignUser({
          selectedUserId: userId,
          updateId,
        });
        setUserFlag(true);
      });
    }
  };

  const handleModalClose = () => {
    router.push(`/board/${boardId}`);
    setIsTitleEmpty(false);
    setDescription("");
  };

  const handleDateChange = (ranges) => {
    setState([ranges.selection]);
    const startValue = ranges.selection.startDate;
    const endValue = ranges.selection.endDate;
    updateDates({ updateId, startValue, endValue });
    setLabelFlag(true);
  };
  const [isOpen, setIsOpen] = useState([]);
  const toggleModal = (index) => {
    const updatedIsOpen = [...isOpen];
    updatedIsOpen[index] = !updatedIsOpen[index];
    setIsOpen(updatedIsOpen);
  };
  const [hoveredAttachmentIndex, setHoveredAttachmentIndex] = useState(-1);

  const handleHover = (index, isHovered) => {
    if (isHovered) {
      setHoveredAttachmentIndex(index);
    } else {
      setHoveredAttachmentIndex(-1);
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    }
  }
  const handleClick = (name, email) => {
    const mentionWithSymbol = `@${name}`;
    const updatedComment = comment.replace(/@[^\s]*(?=@|$)/g, '') + mentionWithSymbol;
    setMention(name);
    const emailArray = [email];
    setEmail(prevEmail => [...prevEmail, ...emailArray]);
    setComment(updatedComment);
    setIsPoperOpen(false);
  };
  const handleInputFocus = (event) => {
    event.target.selectionStart = event.target.selectionEnd = event.target.value.length;
    const inputElement = document.querySelector('.inputWrapper');
    inputElement.focus();
  };
  const usernames = users.map(user => ({ 
    name: `@${user.name}`, 
    email: user.email 
  }));
  
  return (
    <Modal
      backdrop="opaque"
      isOpen={isVisible}
      onClose={handleModalClose}
      placement="center"
      size="3xl"
      className="max-h-[80vh]"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <div className="overflow-y-auto  md:max-h-[600px] md:no-scrollbar ">
              <div className="max-h-[560px] justify-center">
                {loading ?
                  (<Loader></Loader>) :
                  (
                    <>
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-7/12 max-h-[80vh] overflow-y-auto no-scrollbar pb-3">
                          <div className="flex-grow overflow-y-auto no-scrollbar">
                            <div className="flex ">
                              <div className="mt-2">
                                <Tooltip content="Copy link" placement="bottom" showArrow size="sm">
                                  <div><MdLink className="ml-3 text-xl" onClick={handleCopyLink} /></div>
                                </Tooltip>
                                {snackbarOpen && (
                                  <div className="fixed bottom-0 left-0 bg-green-100 text-green-800 p-3 mb-4 ml-4 rounded flex justify-between" role="alert">
                                    <IoMdCheckmarkCircleOutline className="text-green-800 w-6 h-6 mr-2" />
                                    <strong className="font-bold mr-8">Link copied to clipboard!</strong>
                                    <IoClose className="text-green-800 mt-0.5 w-5 h-5" onClick={handleCloseSnackbar} />
                                  </div>
                                )}
                              </div>
                              <Breadcrumbs className="m-2">
                                <BreadcrumbItem>{boardname}</BreadcrumbItem>
                                <BreadcrumbItem>
                                  <Dropdown>
                                    <DropdownTrigger>
                                      <span>{category?.category} </span>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Static Actions">
                                      {categories.map((category) => (
                                        <DropdownItem
                                          key={category.id}
                                          onClick={() => {
                                            handleMoveCard(category.id);
                                          }}
                                          variant="solid"
                                          color="secondary"
                                        >
                                          {category.category}
                                        </DropdownItem>
                                      ))}
                                    </DropdownMenu>
                                  </Dropdown>
                                </BreadcrumbItem>
                                <BreadcrumbItem>{data.name}</BreadcrumbItem>
                              </Breadcrumbs>
                            </div>
                            <ModalBody>
                              <div>
                                <Input
                                  variant="bordered"
                                  value={name}
                                  onChange={handelChange}
                                  onBlur={handelSubmit}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handelSubmit(e)
                                  }}
                                  style={{ fontWeight: 'bold', fontSize: '1.25rem' }}
                                />
                                {isTitleEmpty && (
                                  <Tooltip content="Card name cannot be empty" placement="bottom" size="sm">
                                    <div className="flex justify-end mt-1"><MdErrorOutline style={{ color: "red", fontSize: "medium" }} /></div>
                                  </Tooltip>
                                )}
                              </div>
                              <div className="flex gap-2"><BiSolidCalendar className="mt-1" />Dates</div>
                              <Popover placement="bottom-start" showArrow>
                                <PopoverTrigger>
                                  <div className="flex text-sm">
                                    <Checkbox
                                      className="mt-4"
                                      color="secondary"
                                      checked={isChecked}
                                      onChange={(event) => {
                                        setIsChecked(!isChecked);
                                        checkCompleted({ updateId, isChecked: !isChecked })
                                      }}
                                      isSelected={isChecked} />
                                    <div className="flex">
                                      <Input
                                        labelPlacement="outside"
                                        label="Start-date"
                                        size="sm"
                                        variant="bordered"
                                        value={formattedCreatedAt}
                                        className="text-sm"
                                        style={{ width: '100px' }}
                                      />
                                      <Input
                                        labelPlacement="outside"
                                        label="Due-Date"
                                        className="ml-2"
                                        size="sm"
                                        variant="bordered"
                                        value={formattedDueDate}
                                        style={{ width: '100px' }} />
                                      <div className="mt-6 ml-2">
                                        {isChecked ? <Chip size="sm" className="text-white" color={isChecked ? "success" : "default"} radius="sm">Completed</Chip> : ""}
                                      </div>
                                    </div>
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent >
                                  <div style={{ width: "280px", height: "350px" }}>
                                    <DateRange
                                      className="w-100 100"
                                      style={{ width: "280px", height: "200px" }}
                                      startDatePlaceholder="Start Date"
                                      endDatePlaceholder="End Date"
                                      editableDateInputs={true}
                                      onChange={handleDateChange}
                                      showSelectionPreview={true}
                                      showPreview={true}
                                      moveRangeOnFirstSelection={false}
                                      ranges={state}
                                      direction="vertical"
                                      minDate={new Date()}
                                      color="#7828c8"
                                      rangeColors="#7828c8"
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <Divider />
                              <div className="flex gap-2">
                                <MdDescription className="mt-1" />Description
                              </div>
                              <div className="relative w-full grid grid-cols-15 gap-1">
                                <Textarea
                                  variant="bordered"
                                  labelPlacement="outside"
                                  placeholder="Add Description..."
                                  className="col-span-12 md:col-span-6 md:mb-2"
                                  minRows={3}
                                  value={description === null ? "" : description}
                                  onChange={(e) => {
                                    setDescription(e.target.value);
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const droppedFile = e.dataTransfer.files[0];
                                    handleDroppedFile(droppedFile);
                                  }}
                                  onDragOver={(e) => e.preventDefault()}
                                  style={{
                                    minWidth: 300,
                                    fontStyle: isItalicDescription ? "italic" : "initial",
                                    fontWeight: isBoldDescription ? "bold" : "normal",
                                  }}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant={isBoldDescription ? "flat" : "faded"}
                                    color={isBoldDescription ? "secondary" : "neutral"}
                                    aria-pressed={isBoldDescription}
                                    onClick={handleBoldClickDescription}
                                    className="dark:bg-700 dark:text-black"
                                  >
                                    <MdFormatBold className="w-5 h-5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant={isItalicDescription ? "flat" : "faded"}
                                    color={isItalicDescription ? "secondary" : "neutral"}
                                    aria-pressed={isItalicDescription}
                                    onClick={handleItalicClickDescription}
                                    className="dark:bg-700 dark:text-black"
                                  >
                                    <MdFormatItalic className="w-5 h-5" />
                                  </Button>
                                  <input
                                    type="file"
                                    id="fileInput"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    multiple
                                  />
                                  <label htmlFor="fileInput">
                                    <Button isIconOnly size="sm" variant="faded" onClick={handleButtonClick}>
                                      <IoAttachOutline className="w-5 h-5" />
                                    </Button>
                                  </label>
                                  <div className="flex">
                                    <Button variant="faded" className="bg-[#e4d4f4] text-[#7828c8] hover:bg-[#7828c8] hover:text-white font-semibold" size="sm" onClick={updateCard}>Save</Button>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div>
                                  {alert && (
                                    <div className=" bg-red-100 text-red-800 p-2 rounded flex justify-between" role="alert">
                                      <span className="text-sm">Image size should be less than 1mb.</span>
                                      <IoClose className="text-red-800 mt-0.5 w-5 h-5" onClick={handleClose} />
                                    </div>

                                  )}
                                  {typeError && (
                                    <div className=" bg-red-100 text-red-800 p-2  rounded flex justify-between" role="alert">
                                      <span className="text-sm">Attachment should be image.</span>
                                      <IoClose className="text-red-800 mt-0.5 w-5 h-5" onClick={handleCloseError} />
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 flex gap-2 mb-2">
                                  <IoAttachOutline className="m-1 w-5 h-5" />Attachments
                                </div>
                                <Divider></Divider>
                                <div className="flex flex-row gap-7 flex-wrap">
                                  {attachment && attachment.map((attachment, index) => (
                                    <div className="flex gap-2 mt-2 border-solid border-[1px] border-grey-100 rounded" key={attachment.id}>
                                      <div className="cursor-pointer flex gap-3">
                                        <div className="flex flex-col">
                                          <div
                                            style={{
                                              position: "relative",
                                              display: "inline-block",
                                            }}
                                            onMouseEnter={() =>
                                              handleHover(index, true)
                                            }
                                            onMouseLeave={() =>
                                              handleHover(index, false)
                                            }
                                          >
                                            <Card
                                              radius="none"
                                              className="border-none"
                                            >
                                              <div className="relative group">
                                                <img
                                                  src={attachment.file}
                                                  alt="Attachment"
                                                  style={{ display: 'block', height: '120px', width: '150px' }}
                                                />
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
                                                {hoveredAttachmentIndex === index && (
                                                  <div
                                                    style={{
                                                      position: 'absolute',
                                                      top: '20%',
                                                      left: '70%',
                                                      transform: 'translate(-50%, -50%)',
                                                      display: 'flex',
                                                      justifyContent: 'center',
                                                      alignItems: 'center',
                                                    }}
                                                  >
                                                    <a
                                                      href={attachment.file}
                                                      download={`${attachment.name}.jpg`}
                                                      className="justify-center"
                                                    >
                                                      <MdOutlineFileDownload
                                                        size={24}
                                                        style={{
                                                          marginRight: "5px",
                                                          opacity: 0.8,
                                                          color: "white",
                                                        }}
                                                      />
                                                    </a>
                                                    <BiSolidTrashAlt
                                                      size={24}
                                                      style={{
                                                        marginRight: "5px",
                                                        opacity: 0.8,
                                                        color: "white",
                                                      }}
                                                      onClick={() => {
                                                        handleDelete(
                                                          attachment.id
                                                        );
                                                      }}
                                                    />
                                                    <IoEyeOutline
                                                      size={24}
                                                      onClick={() =>
                                                        toggleModal(index)
                                                      }
                                                      style={{
                                                        opacity: 0.8,
                                                        color: "white",
                                                      }}
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            </Card>
                                          </div>
                                          <div className="p-1 text-sm font-semibold"
                                            style={{
                                              maxWidth: "150px",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}>{attachment.name}</div>
                                          <div className="text-xs pl-1">
                                            {new Date(
                                              attachment.time
                                            ).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                            })}{" "}
                                            {new Date(
                                              attachment.time
                                            ).toLocaleTimeString("en-US", {
                                              hour: "numeric",
                                              minute: "numeric",
                                              hour12: true,
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                      <Modal
                                        isOpen={isOpen[index]}
                                        onOpenChange={() => toggleModal(index)}
                                        className=" pointer"
                                        hideCloseButton={true}
                                        size="xl"
                                      >
                                        <ModalContent>
                                          <>
                                            <ModalBody className="p-0">
                                              <img
                                                src={attachment.file}
                                                height="600px"
                                                width="600px"
                                              />
                                            </ModalBody>
                                          </>
                                        </ModalContent>
                                      </Modal>
                                    </div>
                                  ))}
                              </div>
                            </div>

                              <div className="flex gap-2">
                                <MdLocalOffer className="mt-1" />Labels
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {cardLabel && (
                                  <>
                                    {Object.values(cardLabel).slice(0, 2).map((label, index) => (
                                      <Chip size="md" key={index} style={{ backgroundColor: label.color }} variant="flat" className="text-sm dark:text-900" title={label.name}>
                                        <span style={{
                                          whiteSpace: "nowrap", overflow: "hidden", textOverflow:
                                            label.name.length > 10 ? "ellipsis" : "unset"
                                        }}
                                        >
                                          {label.name.length > 10
                                            ? label.name.slice(0, 10) + "..."
                                            : label.name}
                                        </span>
                                      </Chip>
                                    ))}
                                </>
                              )}

                                <div className="flex flex-wrap gap-2">
                                  <Dropdown placement="top-start">
                                    <DropdownTrigger>
                                      <Button isIconOnly radius="full" className="w-3 h-7 bg-[#e4d4f4] hover:bg-[#7828c8] text-[#7828c8] hover:text-white  dark:bg-700 dark:text-black" variant="faded">
                                        {cardLabel && Object.values(cardLabel).length > 0 ? (
                                          <>
                                            {Object.values(cardLabel).length > 2 ? (
                                              <>
                                                <IoAddOutline className="w-4 h-4 font-semibold" />{Object.values(cardLabel).length - 2}
                                              </>
                                            ) : (<IoAddOutline className="w-4 h-4 font-semibold" />)}
                                          </>) : (<IoAddOutline className="w-4 h-4 font-semibold" />)}
                                      </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                      className="w-48 max-h-52 overflow-auto no-scrollbar dark:text-text"
                                      variant="flat"
                                      closeOnSelect={false}
                                      selectionMode="multiple"
                                      defaultSelectedKeys={cardLabel.map((item) => (item.id))}
                                      onSelectionChange={(selectedKeys) => {
                                        setSelectedKeys(selectedKeys);
                                        handleSelectionChange(selectedKeys, updateId);
                                      }}
                                    >
                                      {labels.map((item) => (
                                        <DropdownItem key={item.id} 
                                        style={{ backgroundColor: item.color, }} 
                                        
                                        >{item.name}</DropdownItem>
                                      ))}
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              </div>

                              <Divider />
                              <div className="flex gap-2 "><IoMdPeople className="mt-1" />Members</div>
                              <div>
                                <Select
                                  items={users.map(user => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    return {
                                      key: user.id.toString(),
                                      ...user,
                                      selected: isSelected,
                                      value: user.id
                                    };
                                  })}
                                  selectedKeys={selectedUsers.map(user => user.toString())}
                                  aria-label="select"
                                  isMultiline={true}
                                  selectionMode="multiple"
                                  placeholder="Add Members"
                                  className="max-w-xs"
                                  variant="bordered"
                                  size="sm"
                                  onSelectionChange={setUserId}
                                  style={{ border: "none" }}
                                  renderValue={(items) => {
                                    return (
                                      <div className="flex flex-wrap gap-2">
                                        <AvatarGroup size="sm" className="justify-start" isBordered max={5}>
                                          {items.map((item) => (
                                            <Tooltip placement="bottom" showArrow size="sm" content={item.textValue} key={item.id}>
                                              <Avatar size="sm" name={item.textValue.substring(0, 1)} src={item.data.photo} />
                                            </Tooltip>
                                          ))}
                                        </AvatarGroup>
                                      </div>
                                    );
                                  }}
                                >
                                  {(user) => (
                                    <SelectItem className="max-h-52 overflow-auto no-scrollbar" variant="solid" color="secondary" value={user.value} key={user.id} textValue={user.name} selected={user.selected}>
                                      <div className="flex-column">
                                        <div className="flex gap-2 items-center">
                                          <Avatar name={user.name.substring(0, 1)} src={user.photo} className="flex-shrink-0 text-lg" size="sm" />
                                          <div className="flex flex-col">
                                            <span className="text-small">{user.name}</span>
                                            <span className="text-tiny">({user.email})</span>
                                          </div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  )}
                                </Select>
                              </div>
                            </ModalBody>
                          </div>
                        </div>
                        <div className="w-full md:w-5/12 max-h-[80vh] flex flex-col m-1" >
                          <div className="flex-grow border border-grey rounded-xl p-2 flex flex-col dark:border-none max-h-70vh overflow-y-auto no-scrollbar">
                            <div className="flex justify-between position-sticky">
                              <div className="flex gap-3"><MdInsertComment className="mt-1" />Comments</div>
                            </div>
                            <div className="flex-grow max-h-70vh overflow-y-auto no-scrollbar">
                              {showComments.length > 0 ? (
                                showComments.map((comment) => (
                                  <div className="pt-2 " key={comment.id}>
                                    <div className="flex gap-2">
                                      <Avatar className="w-6 h-6" name={comment.user?.name.substring(0, 1)} />
                                      <div className="flex flex-col">
                                        <div className="font-semibold text-sm">{comment.user?.name}</div>
                                      </div>
                                      <Dropdown className="min-w-[80px]" placement="bottom-end">
                                        <DropdownTrigger>
                                          <div className="flex ml-auto items-center"><MdOutlineMoreHoriz className="w-4 h-4" /></div>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label="Static Actions">
                                          <DropdownItem variant="solid" color="secondary" onClick={() => { handleEditComment(comment), onClose = { onClose } }} >Edit</DropdownItem>
                                          <DropdownItem variant="solid" color="danger" onClick={(e) => { handleDeleteComment(comment.id); onClose = { onClose } }} >Delete</DropdownItem>
                                        </DropdownMenu>
                                      </Dropdown>
                                    </div>
                                    <div className="text-sm">
                                      {editingComment === comment.id ? (
                                        <div>
                                          <Input
                                            variant="underlined"
                                            className="w-full"
                                            autoFocus
                                            value={editedComment}
                                            onChange={(e) => setEditedComment(e.target.value)}
                                          />
                                          <div className="flex gap-1 p-1">
                                            <Button variant="faded" className="bg-[#e4d4f4] text-[#7828c8] hover:bg-[#7828c8] hover:text-white font-semibold" radius="full" size="sm" onClick={() => handleSaveEdit(comment.id)}>Save</Button>
                                            <Button variant="faded" className="bg-[#e4d4f4] text-[#7828c8] hover:bg-[#7828c8] hover:text-white font-semibold" radius="full" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="ml-10" style={{ wordBreak: "break-word" }}>
                                          {
                                            comment.description.split(new RegExp(`(${usernames.map(user => user.name).join('|')})`, 'g')).map((part, index) => {
                                              const matchedUsernameIndex = usernames.findIndex(user => user.name === part);
                                              if (matchedUsernameIndex !== -1) {
                                                const matchedUser = usernames[matchedUsernameIndex];
                                                return (
                                                  <Tooltip placement="bottom" showArrow size="sm" content={matchedUser.email}>
                                                    <strong>{part}</strong>
                                                  </Tooltip>
                                                );
                                              }
                                              return <span key={index}>{part}</span>;
                                            })
                                          }
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                  <div className="flex flex-col justify-center items-center w-full h-full">
                                    <TfiComment />
                                    <div className="text-lg font-semibold mb-2 dark:text-white">No Comments Yet</div>
                                    <span className="text-sm text-gray-500 text-center mb-4 block">
                                      Comment and @mention <br /> people to notify them.
                                    </span>
                                  </div>                      
                              )}
                            </div>
                            <div className="mt-auto w-full">
                              <div>
                                {filteredUsers.length > 0 && (
                                  <Popover
                                    className="w-fit"
                                    isOpen={isPoperOpen}
                                    align="start"
                                    placement="top"
                                    onClose={() => setIsInputFocused(false)}
                                  >
                                    <PopoverTrigger>
                                      <div>
                                      </div>
                                    </PopoverTrigger>
                                    <PopoverContent aria-label="Static Actions" tabIndex={!null} className="p-2 bg-white border border-gray-200 rounded shadow-md items-start">
                                      {filteredUsers.map((user) => (
                                        <div key={user.id} onClick={() => handleClick(user.name, user.email)} className="flex items-start py-2 cursor-pointer transition duration-200 group w-full hover:bg-purple-700 hover:text-white">
                                          <Avatar name={user.name.substring(0, 1)} className="mr-2" />
                                          <div className="flex flex-col">
                                            <div className="font-semibold group-hover:text-white">{user.name}</div>
                                            <div className="text-gray-500 group-hover:text-white">{user.email}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                              <div className="p-0 positio-sticky">
                                <Input
                                  value={comment}
                                  onChange={handleCommentChange}
                                  onBlur={() => setIsInputFocused(false)}
                                  onFocus={handleInputFocus}
                                  className="inputWrapper p-0"
                                  placeholder="Add a comment..."
                                  endContent={<button onClick={handleComment}><IoMdSend /></button>}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
