"use client"

/* eslint-disable  */
import { useEffect, useState } from "react";
import { Draggable, DropResult, Droppable } from "react-beautiful-dnd";
import { DndContext } from "../context/DndContext";
import CardOption from "./CardOption";
import { updateCardPositionInDB } from "@/server/UpdateCardOrder";
import { createTitle } from "@/server/task";
import { createTask, showAllData } from "@/server/category";
import { Box, Stack } from "@mui/material";
import { CircularProgress } from "@nextui-org/react";
import { useMediaQuery } from "@mui/material";
import { useGlobalSyncupContext } from "../context/SyncUpStore";
import AttachmentIcon from "@mui/icons-material/Attachment";
import InsertCommentIcon from "@mui/icons-material/InsertComment";
import CategoryOptions from "./CategoryOptions";
import GetSyncupData from "../../server/GetSyncupData";
import { moveCardToList } from "@/server/UpdateCardOrder";
import Link from "next/link";
import View from "../components/View";
import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarGroup, AvatarIcon, Tooltip } from "@nextui-org/react";
import { User } from "@/server/user";
import { useSession } from "next-auth/react";
import { fetchBoarduser } from "@/server/board";

const Cards = ({ boardId }) => {
  const {
    data,
    setData,
    setLoad,
    load,
    categoryLoad,
    setCategoryLoad,
    TableView,
    setTableView,
  } = useGlobalSyncupContext();
  const router = useRouter();
  const [cid, setCId] = useState("s");
  const [id, setId] = useState<number>();
  const [showModal, setShowModal] = useState(false);
  const [showModalComponent, setShowModalComponent] = useState(false);
  const [inputfeild, showInput] = useState(false);
  const [flag, setFlag] = useState(true);
  const [updateId, setUpdateId] = useState<number>();
  const [newListInput, setNewListInput] = useState("");
  const isSmallScreen = useMediaQuery("(max-width: 400px)");
  const [cardName, setCardName] = useState("");
  const [inputFieldVisible, setInputFieldVisible] = useState(false);
  const [category, setCategory] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { data: session } = useSession();
  const [boarduser, setboarduser] = useState();

  const handleCardRowClick = (card, cardid) => {
    setSelectedCard(card);
    setShowModalComponent(true);
    router.push(`/board/${boardId}/${cardid}`);
  };
  const fetchboard = async () => {
    const board = await fetchBoarduser(boardId);
    const userIds = board.map(user => user.id)
    setboarduser(userIds);
  };
  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    const newData = [...data];
    const sourceIndex = source.index;
    const destIndex = destination.index;

    if (source.droppableId === destination.droppableId) {
      const droppableIndex = parseInt(
        destination.droppableId.replace("droppable", "")
      );
      const task = newData[droppableIndex];
      const [movedCard] = task.cards.splice(sourceIndex, 1);
      task.cards.splice(destIndex, 0, movedCard);

      task.cards.forEach((card, index) => {
        card.order = index;
      });
      setData(newData);
      try {
        await Promise.all(
          task.cards.map(async (card) => {
            await updateCardPositionInDB(card.id, task.id, card.order);
          })
        );
        fetchData();
      } catch (error) {
        console.error("Error updating card position:", error);
      }
    } else {
      const sourceDroppableIndex = parseInt(
        source.droppableId.replace("droppable", "")
      );
      const destDroppableIndex = parseInt(
        destination.droppableId.replace("droppable", "")
      );
      const movedCard = newData[sourceDroppableIndex].cards[sourceIndex];

      newData[sourceDroppableIndex].cards.splice(sourceIndex, 1);

      newData[sourceDroppableIndex].cards.forEach((card, index) => {
        card.order = index;
      });

      newData[destDroppableIndex].cards.forEach((card, index) => {
        card.order = index;
      });

      newData[destDroppableIndex].cards.splice(destIndex, 0, movedCard);

      newData[destDroppableIndex].cards.forEach((card, index) => {
        card.order = index;
      });

      setData(newData);
      try {
        await Promise.all(
          newData[destDroppableIndex].cards.map(async (card) => {
            await updateCardPositionInDB(
              card.id,
              newData[destDroppableIndex].id,
              card.order
            );
          })
        );
        fetchData();
      } catch (error) {
        console.error("Error updating card position:", error);
      }
    }
    fetchData();
  };

  const fetchData = async () => {
    try {
      const updatedData = await GetSyncupData(boardId);
      setData(updatedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoad(false);
      setCategoryLoad(false);
    }
  };
  const [title, setTitle] = useState("");
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setFlag(false);
  };
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    showInput(false);
    setFlag(true);
    await createTitle({ title }, id,boarduser);
    fetchData();
    setLoad(false);

    setCId(title);
    setTitle("");
    setSubmitted(true);
    fetchData();
  };
  const handleOnclose = () => {
    setShowModalComponent(false);
    fetchData();
  };
  const handleAddListClick = () => {
    setInputFieldVisible(true);
  };

  const handleAddListClose = async () => {
    setInputFieldVisible(false);
  };

  const handleAddList = async () => {
    try {
      if (newListInput.trim() === "") {
        handleAddListClose();
      } else if (newListInput.trim() !== "") {
        setCategoryLoad(true);
        await createTask(newListInput, boardId,null,boarduser);
        setNewListInput("");
        setInputFieldVisible(false);
      }
      fetchData();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  async function fetchUserData() {
    const userEmail = session.user.email;
    const user = await User({ userEmail });

    setUserRole(user.role);
  }

  fetchUserData();
  useEffect(() => {
    fetchboard();
   
  }, [boardId]);
  return (
    <>
      {TableView ? (
        <View data={data} handleCardRowClick={handleCardRowClick} />
      ) : (
        <DndContext onDragEnd={onDragEnd}>
          <Stack
            direction={{ xs: "row", sm: "row" }}
            spacing={{ xs: 1, sm: 2, md: 4 }}
            className={`overflow-x-scroll no-scrollbar ${
              isSmallScreen ? "min-w-80 ml-5" : "ml-3"
            }`}
          >
            {data?.map((val, index) => (
              <Droppable droppableId={`droppable${index}`}>
                {(provided) => (
                  <Box>
                    <Box className={`overflow-x-auto`}>
                      <button
                        style={{ backgroundColor: val.color || "#8e78b6" }}
                        className={` dark:bg-800  flex justify-between mb-1 ${isSmallScreen ? "min-w-80" : "w-56"
                          } mt-5 font-bold text-white py-2 px-4  border-gray-400 dark:bg-800 rounded shadow;`}
                      >
                        <span className="truncate">{val.title}</span>
                        <span>
                          <CategoryOptions />
                        </span>
                      </button>
                    </Box>
                    <Box 
                      style={{
                        maxHeight: "24rem",
                        minHeight: "1rem",
                        height: "auto",
                      }}
                      className={`overflow-y-scroll no-scrollbar ${
                        isSmallScreen ? "min-w-80" : "w-56"
                      }`}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {val?.cards?.map((card, index) => (
                        <Draggable
                        key={card.id}
                          draggableId={card?.id?.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              className=" dark:bg-900  card rounded mb-3 shadow-none"
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                            >
                              <CardBody
                                onClick={() => {
                                  setShowModalComponent(true),
                                    setUpdateId(card.id),
                                    setId(card.id),
                                    setCategory(val.title),
                                    setCardName(card.name);
                                }}
                                className="py-0 px-2"
                              >
                                <Link
                                  legacyBehavior
                                  href={`/board/${boardId}/${card.id}`}
                                  passHref
                                >
                                  <a
                                    className="cursor-pointer"
                                    style={{
                                      textDecoration: "none",
                                      height: "100%",
                                    }}
                                  >
                                    <CardHeader className="flex justify-between p-2">
                                      <span
                                        className=""
                                        style={{
                                          maxWidth:
                                            card.name.length > 15
                                              ? "150px"
                                              : "auto",
                                          wordWrap:
                                            card.name.length > 30
                                              ? "break-word"
                                              : "normal",
                                        }}
                                      >
                                        {card.name.length > 15
                                          ? card.name.slice(0, 30) + "..."
                                          : card.name}
                                      </span>
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowModal(false);
                                        }}
                                      >
                                        <div
                                          onClick={(e) => e.preventDefault()}
                                        >
                                          <CardOption
                                            taskId={card.id}
                                            currentListId={val.id}
                                            moveCardToList={moveCardToList}
                                            updateCategories={handleAddList}
                                            cardTitle={card.name}
                                            boardId={boardId}
                                            boarduser={boarduser}
                                          />
                                        </div>
                                      </span>
                                    </CardHeader>
                                    <Box className="m-0 rounded-none ">
                                      <Box>
                                        <p
                                          className={` dark:text-text text-xs ${
                                            card.isBold ? "font-bold" : ""
                                          } ${card.isItalic ? "italic" : ""}`}
                                        >
                                          {card?.description &&
                                          card.description.length > 50
                                            ? card.description.slice(0, 50) +
                                              "..."
                                            : card.description}
                                        </p>
                                      </Box>
                                      <Box className="flex justify-start my-2">
                                        {card.label && card.label.length > 0 ? (
                                          <>
                                            {card.label
                                              .slice(0, 2)
                                              .map((label, index) => (
                                                <div
                                                  key={index}
                                                  className="text-black overflow-hidden font-semibold h-6 inline-flex items-center justify-center px-2 rounded-xl text-xs"
                                                  style={{
                                                    backgroundColor:
                                                      label.color,
                                                    marginRight:
                                                      index < 2 ? "3px" : 0,
                                                  }}
                                                  title={label.name}
                                                >
                                                  <span
                                                  className="dark:text-900"
                                                    style={{
                                                      whiteSpace: "nowrap",
                                                      overflow: "hidden",
                                                      textOverflow:
                                                        label.name.length > 12
                                                          ? "ellipsis"
                                                          : "unset",
                                                    }}
                                                  >
                                                    {label.name.length > 12
                                                      ? label.name.slice(
                                                          0,
                                                          12
                                                        ) + "..."
                                                      : label.name}
                                                  </span>
                                                </div>
                                              ))}
                                            {card.label.length > 2 && (
                                              <div className="text-xs inline-block font-medium">
                                                <div className="rounded-full border border-gray-400 flex items-center justify-center h-7 w-7 dark:text-text">
                                                  +{card.label.length - 2}
                                                </div>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <span></span>
                                        )}
                                      </Box>
                                    </Box>
                                    <Box className="flex items-center justify-between">
                                      <Box>
                                        <Box
                                          className="inline-block"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowModal(false);
                                          }}
                                        >
                                          <span className="inline-block">
                                            <AttachmentIcon className="text-gray-600 dark:text-text" />
                                          </span>
                                          <span className="inline-block mr-3 text-sm ml-1 dark:text-text">
                                            {card.attachments.length}
                                          </span>
                                        </Box>
                                        <Box
                                          className="inline-block"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowModal(false);
                                          }}
                                        >
                                          <InsertCommentIcon className="text-base text-gray-600 dark:text-text" />
                                          <span className="inline-block mr-3 text-sm ml-1  dark:text-text">
                                            {card.comments.length}
                                          </span>
                                        </Box>
                                      </Box>

                                      <Box className="flex mb-2">
                                        {card.assignedUsers.length > 0 ? (
                                          <AvatarGroup
                                            className="mt-1"
                                            size="sm"
                                            max={2}
                                            total={card.assignedUsers.length}
                                            renderCount={(count) =>
                                              count > 2 && (
                                                <Avatar
                                                  isBordered
                                                  name={`+${count - 2}`}
                                                  size="sm"
                                                />
                                              )
                                            }
                                          >
                                            {card.assignedUsers
                                              .slice(0, 3)
                                              .map((user, index) => (
                                                <Avatar
                                                  isBordered
                                                  key={index}
                                                  name={
                                                    user.name
                                                      ? user.name.charAt(0)
                                                      : ""
                                                  }
                                                  size="sm"
                                                  src={user.photo}
                                                />
                                              ))}
                                          </AvatarGroup>
                                        ) : (
                                          <div className="flex items-center">
                                            <Avatar
                                              isBordered
                                              icon={<AvatarIcon />}
                                              className="text-black/80 dark:bg-900 dark:text-text dark:border-900 "
                                              size="sm"
                                            />
                                          </div>
                                        )}
                                      </Box>
                                    </Box>
                                  </a>
                                </Link>
                              </CardBody>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {inputfeild && val.id === id && (
                        <form id="input" onSubmit={handleSubmit}>
                          <input
                            autoFocus
                            value={title}
                            type="text"
                            onChange={handleTitleChange}
                            onBlur={handleSubmit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSubmit(e);
                            }}
                            className="w-full capitalize p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                            placeholder="Enter the title"
                          />
                        </form>
                      )}
                    </Box>
                    <Box className="flex justify-center">
                      {load && val.id === id ? (
                        <CircularProgress style={{ color: "#ed7620" }} />
                      ) : (
                        <Button
                          form="input"
                          type={flag ? "button" : "submit"}
                          className="flex w-3/5 justify-center items-center bg-[#ede7f6]  my-1.5 text-[#7754bd]  hover:bg-[#8e78b6] hover:text-white font-semibold  px-1 py-1 border border-gray-400 rounded-lg shadow dark:bg-700 dark:text-black"
                          onClick={() => {
                            if (val.id !== id || !submitted || !inputfeild) {
                              setId(val.id);
                              showInput(true);
                              setSubmitted(false);
                            } else {
                              setSubmitted(false);
                            }
                          }}
                        >
                          Add Card +
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Droppable>
            ))}

            <Box>
              <Box>
                {inputFieldVisible && !categoryLoad && (
                  <input
                    autoFocus
                    type="text"
                    value={newListInput}
                    onChange={(e) => setNewListInput(e.target.value)}
                    onBlur={handleAddList}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddList();
                      }
                    }}
                    className="w-48 p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 mt-5"
                    placeholder="Enter list name"
                  />
                )}
              </Box>
              <Box>
                {categoryLoad ? (
                  <CircularProgress style={{ color: "#ed7620" }} />
                ) : (
                  <Button
                    type="button"
                    className={`flex mt-5 justify-center items-center bg-[#683ab7] text-white hover:bg-[#7754BC] px-4 py-2 border dark:bg-700 dark:text-black border-gray-400 rounded shadow ${
                      inputFieldVisible ? "w-16 mt-2 mx-auto" : "w-48"
                    }`}
                    onClick={
                      inputFieldVisible ? handleAddList : handleAddListClick
                    }
                  >
                    {inputFieldVisible ? "Add+" : "Add List"}
                  </Button>
                )}
              </Box>
            </Box>
          </Stack>
        </DndContext>
      )}
    </>
  );
};
export default Cards;
