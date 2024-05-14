"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectItem,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Input,
  Button,
} from "@nextui-org/react";
import { MdIncompleteCircle,MdOutlineKeyboardArrowRight,MdLabelOutline} from "react-icons/md";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { GoClock } from "react-icons/go";
import { useSession } from "next-auth/react";
import { IoIosSearch } from "react-icons/io";
import { IoFilterOutline,IoCloseOutline,IoShareSocial } from "react-icons/io5";
import { IoMdFlash } from "react-icons/io";
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore";
import { usePathname } from "next/navigation";
export default function Subnav() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSmallViewport, setIsSmallViewport] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const { data } = useGlobalSyncupContext();
  const { cardState, setCardState } = useGlobalSyncupContext();
  const { searchState, setSearchState } = useGlobalSyncupContext();
  const { filterState, setFilterState } = useGlobalSyncupContext();
  const [labels, setLabels] = useState([]);
  const [assignedUserNames, setAssignedUserNames] = useState([]);
  const { setTableView, TableView } = useGlobalSyncupContext();
  const pathname = usePathname();
  const projectPages = ["/projectsetting", "/board"];
  const isInProjectPages = projectPages.includes(pathname);
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const uniqueLabels = new Set();

    const labels = Array.from(
      data
        .flatMap((column) =>
          column.cards.flatMap((card) =>
            card.label.map((label) => ({
              name: label.name,
              color: label.color,
            }))
          )
        )
        .filter((label) => {
          const labelKey = `${label.name}-${label.color}`;
          if (uniqueLabels.has(labelKey)) {
            return false;
          } else {
            uniqueLabels.add(labelKey);
            return true;
          }
        })
        .sort()
    );

    setLabels(labels);
  }, [data]);
  useEffect(() => {
    const assignedUserNames = Array.from(
      new Set(
        data
          .flatMap((column) =>
            column.cards.flatMap((card) =>
              card.assignedUsers.map((user) => user.name)
            )
          )
          .sort()
      )
    );
    setAssignedUserNames(assignedUserNames);
  }, [data]);

  useEffect(() => {
    function handleResize() {
      setIsOpen(false);
      setAnchorEl(null);
      setfilterstates(null);
      setIsSmallViewport(window.innerWidth <= 617);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [filter, setfilterstates] = useState(null);
  const handleKeyDown = (event) => {
    event.stopPropagation();
  };

  const handleTableViewClick = () => {
    setTableView((prevSelected) => !prevSelected);
  };

  const { data: session, status } = useSession();

  const handleSearchChange = (event) => {
    setCardState(event.target.value);
  };

  const handleSearchInputChange = (event) => {
    setSearchState(event.target.value);
  };
  function handleMemberSelectChange(event) {
    const selectedMember = event.target.value;
    setSelectedMember(selectedMember);
    setFilterState((prevFilters) => ({
      ...prevFilters,
      specificMember: selectedMember !== "" ? selectedMember : "",
    }));
  }

  const handleFilterChange = (event) => {
    const { name, checked } = event.target;
    if (name === "slabel") {
      if (checked) {
        const selectedLabels = labels.filter((item) =>
          selectedKeys.has(item.name)
        );
        setFilterState((prevFilters) => ({
          ...prevFilters,
          specificLabel:
            selectedLabels.length > 0 ? selectedLabels[0].name : "",
        }));
      } else {
        setFilterState((prevFilters) => ({
          ...prevFilters,
          specificLabel: "",
        }));
      }
    } else if (name === "smember") {
      setFilterState((prevFilters) => ({
        ...prevFilters,
        specificMember: checked ? event.target.value : "",
      }));
    } else if (name === "isMarkedAsCompleted") {
      setFilterState((prevFilters) => ({
        ...prevFilters,
        isMarkedAsCompleted: checked,
      }));
    } else if (name === "isMarkedAsInCompleted") {
      setFilterState((prevFilters) => ({
        ...prevFilters,
        isMarkedAsInCompleted: checked,
      }));
    } else {
      setFilterState((prevFilters) => ({
        ...prevFilters,
        [name]: checked,
      }));
    }
  };
  const selectedValuee = React.useMemo(() => {
    const selectedLabels = labels.filter((item) => selectedKeys.has(item.name));
    return selectedLabels.map((label) => ({
      name: label.name,
      color: label.color,
    }));
  }, [selectedKeys, labels]);

  function handleLabelChange(selectedKeys) {
    {
      const keysArray = Array.from(selectedKeys);
      setFilterState((prevFilters) => ({
        ...prevFilters,
        specificLabel: keysArray[0] !== "" ? keysArray[0] : "",
      }));
    }
  }
  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };
  const handleClosefilter = () => {
    setIsOpen(false);
  };
  return (
    <div className="flex flex-col mr-6">
      <div className="flex mb-4 mt-3 dark:bg">
        <div>
          <Dropdown shouldBlockScroll={false} className="dark:bg">
            <DropdownTrigger>
              <Button variant="light" className="font-meduim text-xl">
                Board
                <MdOutlineKeyboardArrowRight size={100} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Action event example">
              <DropdownItem key="Table View" onClick={handleTableViewClick}>
                Table View
              </DropdownItem>
              <DropdownItem key="Report">Report</DropdownItem>
              <DropdownItem key="Releases">Releases</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex gap-4 items-center ml-auto">
          {!isInProjectPages && (
            <Button className=" text-[#fefefe] bg-[#683ab7] dark:bg-700 dark:text-black">
              <IoMdFlash size={25} />
              {!isSmallViewport && "Release"}
            </Button>
          )}
          {!isInProjectPages && (
            <Button className=" text-[#fefefe] bg-[#683ab7] dark:bg-700 dark:text-black">
              <IoShareSocial size={25} />
              {!isSmallViewport && "Share"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex ">
        <div className="serachbar w-1/2 flex h-9  flex-col gap-2 max-w-[450px] ">
          <Input
            placeholder=" Type Search here..."
           
            className="h-12 ml-4 rounded-xl dark:bg-background dark:text"
            onChange={handleSearchInputChange}
            startContent={
              <IoIosSearch
                size={20}
                className="text-black/50 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0"
              />
            }
           
          />
        </div>

        <div className="align-content: center; ml-auto ">
          {!isSmallViewport && !isInProjectPages && (
            <>
              <div className="mr-0">
                <Button
                  color="secondary"
                  sx={{
                    display: "flex",
                    borderRadius: "8px",
                    p: 1,
                    backgroundColor: "#ede7f6",
                    font: "bold",
                   
                  }}
                  className="dark:bg-700 dark:text-black"
                  onClick={handleButtonClick}
                  variant="light"
                >
                  <IoFilterOutline size={20} />
                  Filter
                </Button>
              </div>
              {isOpen && (
                <div class="flex justify-end">
                  <Dropdown className="dark:bg"
                    closeOnSelect={false}
                    placement="bottom"
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    shouldBlockScroll={false}
                    style={{ marginRight: "-1.5vw" }}
                  >
                    {isOpen && (
                      <DropdownMenu
                        style={{ width: 400 }}
                        variant="light"
                        aria-label="User Menu"
                      >
                        <DropdownSection>
                          <DropdownItem>
                            <sction className="flex ">
                              <section className="text-xl mt-2">Filter</section>
                              <section className="flex-grow flex justify-end">
                                <Button
                                  isIconOnly
                                  variant="light"
                                  onClick={handleClosefilter}
                                >
                                  <IoCloseOutline size={23} />
                                </Button>
                              </section>
                            </sction>
                          </DropdownItem>
                        </DropdownSection>
                        <DropdownSection className="popover-scroll-container max-h-[63vh] lg:max-h-[63vh] md:max-h-[54vh] sm:max-h-[50vh] xs:max-h-[40vh] overflow-y-auto">
                          <DropdownItem className="mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg ">Keywords</span>
                              <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                <Input
                                  size="sm"
                                  label="Keywords"
                                  onKeyDown={handleKeyDown}
                                  onChange={handleSearchChange}
                                  value={cardState}
                                />
                              </div>
                              <div className="mt-1">
                                <small className="text-gray-500">
                                  Search Cards, Members, Labels...
                                </small>
                              </div>
                            </div>
                          </DropdownItem>

                          <DropdownItem className="mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg mb-2 ">Members</span>
                              <Checkbox
                                defaultSelected
                                color="secondary"
                                checked={filterState.member}
                                value={filterState.member}
                                isSelected={filterState.member}
                                onChange={handleFilterChange}
                                name="member"
                              >
                                <div className="flex items-center">
                                  <CiUser size={20} />
                                  <span className="ml-2">Member</span>
                                </div>
                              </Checkbox>
                            </div>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.assignedToMe}
                              isSelected={filterState.assignedToMe}
                              onChange={handleFilterChange}
                              name="assignedToMe"
                            >
                              <div className="flex items-center">
                                <div
                                  className="w-5 h-5 mr-2 rounded-full border border-gray-700"
                                  style={{
                                    backgroundColor: "#DB862B",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: "14px",
                                  }}
                                >
                                  {session?.user?.name
                                    .slice(0, 1)
                                    .toUpperCase()}{" "}
                                </div>
                                Cards Assigned to me
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2 ">
                            <div className="flex items-center">
                              <Select
                                className="dark:bg max-w-md ml-2"
                                placeholder="Select a member"
                                value={selectedMember}
                                onChange={handleMemberSelectChange}
                              >
                                {assignedUserNames.length === 0 ? (
                                  <SelectItem>No members available</SelectItem>
                                ) : (
                                  assignedUserNames.map((userName) => (
                                    <SelectItem key={userName} value={userName}>
                                      {userName}
                                    </SelectItem>
                                  ))
                                )}
                              </Select>
                            </div>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg mb-2 ">DueDate</span>
                              <Checkbox
                                defaultSelected
                                color="secondary"
                                checked={filterState.overdue}
                                onChange={handleFilterChange}
                                isSelected={filterState.overdue}
                                name="overdue"
                              >
                                <div className="flex items-center">
                                  <GoClock
                                    size={20}
                                    color="white"
                                    style={{
                                      backgroundColor: "#9e2714",
                                      borderRadius: "50%",
                                    }}
                                  />

                                  <span className="ml-2">Overdue</span>
                                </div>
                              </Checkbox>
                            </div>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.dueNextDay}
                              onChange={handleFilterChange}
                              isSelected={filterState.dueNextDay}
                              name="dueNextDay"
                            >
                              <div className="flex items-center">
                                <GoClock
                                  size={20}
                                  color="white"
                                  style={{
                                    backgroundColor: "#f0d87a",
                                    borderRadius: "50%",
                                  }}
                                />

                                <span className="ml-2">Due to Next Day</span>
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.dueNextWeek}
                              onChange={handleFilterChange}
                              isSelected={filterState.dueNextWeek}
                              name="dueNextWeek"
                            >
                              <div className="flex items-center">
                                <GoClock
                                  size={20}
                                  color="black"
                                  style={{
                                    backgroundColor: "#e8e8e8",
                                    borderRadius: "50%",
                                  }}
                                />

                                <span className="ml-2">Due to Next Week</span>
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.dueNextMonth}
                              isSelected={filterState.dueNextMonth}
                              onChange={handleFilterChange}
                              name="dueNextMonth"
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <GoClock
                                  size={20}
                                  color="black"
                                  style={{
                                    backgroundColor: "#e8e8e8",
                                    borderRadius: "50%",
                                  }}
                                />

                                <span style={{ marginLeft: "8px" }}>
                                  Due to Next Month
                                </span>
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.isMarkedAsCompleted}
                              isSelected={filterState.isMarkedAsCompleted}
                              onChange={handleFilterChange}
                              name="isMarkedAsCompleted"
                            >
                              <div className="flex items-center">
                                <IoCheckmarkDoneCircleOutline size={23} />
                                <span className="ml-2">
                                  {" "}
                                  Marked as Completed
                                </span>
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.isMarkedAsInCompleted}
                              isSelected={filterState.isMarkedAsInCompleted}
                              onChange={handleFilterChange}
                              name="isMarkedAsInCompleted"
                            >
                              <div className="flex items-center">
                                <MdIncompleteCircle size={20} color="#e8e8e8" />
                                <span className="ml-2">
                                  {" "}
                                  Marked as Incompleted
                                </span>
                              </div>
                            </Checkbox>
                          </DropdownItem>

                          <DropdownItem className="mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg mb-2 ">Labels</span>
                              <Checkbox
                                defaultSelected
                                color="secondary"
                                checked={filterState.label}
                                isSelected={filterState.label}
                                onChange={handleFilterChange}
                                name="label"
                              >
                                {" "}
                                <div className="flex items-center ">
                                <MdLabelOutline size={20} />
                                  <span className="ml-2">Label</span>
                                </div>
                              </Checkbox>
                            </div>
                          </DropdownItem>

                          <DropdownItem className="mb-2">
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button
                                    variant="flat"
                                    className=" w-full"
                                    style={{
                                      backgroundColor:
                                        selectedValuee.length > 0
                                          ? selectedValuee[0].color
                                          : "",
                                    }}
                                  >
                                    {selectedValuee.length > 0
                                      ? selectedValuee[0].name
                                      : "Select a Label"}
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  className="w-96 "
                                  aria-label="Multiple selection example"
                                  variant="flat"
                                  closeOnSelect={false}
                                  selectionMode="single"
                                  selectedKeys={selectedKeys}
                                  onSelectionChange={(selectedKeys) => {
                                    setSelectedKeys(selectedKeys);
                                    handleLabelChange(selectedKeys);
                                  }}
                                >
                                  {labels.map((item) => (
                                    <DropdownItem
                                      className="w-full dark:text-900"
                                      key={item.name}
                                      style={{ backgroundColor: item.color }}
                                      value={item.name}
                                    >
                                      {item.name}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </DropdownItem>
                        </DropdownSection>
                      </DropdownMenu>
                    )}
                  </Dropdown>
                </div>
              )}
            </>
          )}
          {isSmallViewport && !isInProjectPages && (
            <>
              <div className="mr-6">
                <Button
                  style={{
                    display: "flex",
                    borderRadius: "8px",
                    p: 1,
                    color: "#7754bd",
                    backgroundColor: "#ede7f6",
                  }}
                  onClick={handleButtonClick}
                  variant="light"
                >
             <IoFilterOutline size={20}/>
                </Button>
              </div>
              {isOpen && (
                <div class="flex justify-end mr-0">
                  <Dropdown
                    closeOnSelect={false}
                    placement="bottom"
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    shouldBlockScroll={false}
                    style={{ marginRight: "-4vw" }}
                  >
                    {isOpen && (
                      <DropdownMenu
                        style={{ width: 300 }}
                        variant="light"
                        aria-label="User Menu"
                      >
                        <DropdownSection>
                          <DropdownItem>
                            <sction className="flex ">
                              <section className="text-xl mt-2">Filter</section>
                              <section className="flex-grow flex justify-end">
                                <Button
                                  isIconOnly
                                  variant="light"
                                  onClick={handleClosefilter}
                                >
                                  <IoCloseOutline size={23} />
                                </Button>
                              </section>
                            </sction>
                          </DropdownItem>
                        </DropdownSection>
                        <DropdownSection className="popover-scroll-container max-h-[65vh] overflow-y-auto">
                          <DropdownItem className="mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg ">Keywords</span>
                              <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                <Input
                                  size="sm"
                                  label="Keywords"
                                  onKeyDown={handleKeyDown}
                                  onChange={handleSearchChange}
                                  value={cardState}
                                />
                              </div>
                              <div className="mt-1">
                                <small className="text-gray-500">
                                  Search Cards, Members, Labels...
                                </small>
                              </div>
                            </div>
                          </DropdownItem>

                          <DropdownItem className="mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg mb-2 ">Members</span>
                              <Checkbox
                                defaultSelected
                                color="secondary"
                                checked={filterState.member}
                                value={filterState.member}
                                isSelected={filterState.member}
                                onChange={handleFilterChange}
                                name="member"
                              >
                                <div className="flex items-center">
                                  <CiUser size={20} />
                                  <span className="ml-2">Member</span>
                                </div>
                              </Checkbox>
                            </div>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.assignedToMe}
                              isSelected={filterState.assignedToMe}
                              onChange={handleFilterChange}
                              name="assignedToMe"
                            >
                              <div className="flex items-center">
                                <div
                                  className="w-5 h-5 mr-2 rounded-full border border-gray-700"
                                  style={{
                                    backgroundColor: "#DB862B",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: "14px",
                                  }}
                                >
                                  {session?.user?.name
                                    .slice(0, 1)
                                    .toUpperCase()}{" "}
                                </div>
                                Cards Assigned to me
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2 ">
                            <div className="flex items-center">
                              <Select
                                className="max-w-md ml-2"
                                placeholder="Select a member"
                                value={selectedMember}
                                onChange={handleMemberSelectChange}
                              >
                                {assignedUserNames.length === 0 ? (
                                  <SelectItem>No members available</SelectItem>
                                ) : (
                                  assignedUserNames.map((userName) => (
                                    <SelectItem key={userName} value={userName}>
                                      {userName}
                                    </SelectItem>
                                  ))
                                )}
                              </Select>
                            </div>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg mb-2 ">DueDate</span>
                              <Checkbox
                                defaultSelected
                                color="secondary"
                                checked={filterState.overdue}
                                onChange={handleFilterChange}
                                isSelected={filterState.overdue}
                                name="overdue"
                              >
                                <div className="flex items-center">
                                  <GoClock
                                    size={20}
                                    color="white"
                                    style={{
                                      backgroundColor: "#9e2714",
                                      borderRadius: "50%",
                                    }}
                                  />

                                  <span className="ml-2">Overdue</span>
                                </div>
                              </Checkbox>
                            </div>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.dueNextDay}
                              onChange={handleFilterChange}
                              isSelected={filterState.dueNextDay}
                              name="dueNextDay"
                            >
                              <div className="flex items-center">
                                <GoClock
                                  size={20}
                                  color="white"
                                  style={{
                                    backgroundColor: "#f0d87a",
                                    borderRadius: "50%",
                                  }}
                                />

                                <span className="ml-2">Due to Next Day</span>
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.dueNextWeek}
                              onChange={handleFilterChange}
                              isSelected={filterState.dueNextWeek}
                              name="dueNextWeek"
                            >
                              <div className="flex items-center">
                                <GoClock
                                  size={20}
                                  color="black"
                                  style={{
                                    backgroundColor: "#e8e8e8",
                                    borderRadius: "50%",
                                  }}
                                />

                                <span className="ml-2">Due to Next Week</span>
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.dueNextMonth}
                              isSelected={filterState.dueNextMonth}
                              onChange={handleFilterChange}
                              name="dueNextMonth"
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <GoClock
                                  size={20}
                                  color="black"
                                  style={{
                                    backgroundColor: "#e8e8e8",
                                    borderRadius: "50%",
                                  }}
                                />

                                <span style={{ marginLeft: "8px" }}>
                                  Due to Next Month
                                </span>
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.isMarkedAsCompleted}
                              isSelected={filterState.isMarkedAsCompleted}
                              onChange={handleFilterChange}
                              name="isMarkedAsCompleted"
                            >
                              <div className="flex items-center">
                                <IoCheckmarkDoneCircleOutline size={23} />
                                <span className="ml-2">
                                  {" "}
                                  Marked as Completed
                                </span>
                              </div>
                            </Checkbox>
                          </DropdownItem>
                          <DropdownItem className="mb-2">
                            <Checkbox
                              defaultSelected
                              color="secondary"
                              checked={filterState.isMarkedAsInCompleted}
                              isSelected={filterState.isMarkedAsInCompleted}
                              onChange={handleFilterChange}
                              name="isMarkedAsInCompleted"
                            >
                              <div className="flex items-center">
                                <MdIncompleteCircle size={20} color="#e8e8e8" />
                                <span className="ml-2">
                                  {" "}
                                  Marked as Incompleted
                                </span>
                              </div>
                            </Checkbox>
                          </DropdownItem>

                          <DropdownItem className="mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg mb-2 ">Labels</span>
                              <Checkbox
                                defaultSelected
                                color="secondary"
                                checked={filterState.label}
                                isSelected={filterState.label}
                                onChange={handleFilterChange}
                                name="label"
                              >
                                {" "}
                                <div className="flex items-center ">
                                <MdLabelOutline size={20} />
                                  <span className="ml-2">Label</span>
                                </div>
                              </Checkbox>
                            </div>
                          </DropdownItem>

                          <DropdownItem className="mb-2">
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button
                                    variant="flat"
                                    className=" w-full"
                                    style={{
                                      backgroundColor:
                                        selectedValuee.length > 0
                                          ? selectedValuee[0].color
                                          : "",
                                    }}
                                  >
                                    {selectedValuee.length > 0
                                      ? selectedValuee[0].name
                                      : "Select a Label"}
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  className="w-96"
                                  aria-label="Multiple selection example"
                                  variant="flat"
                                  closeOnSelect={false}
                                  selectionMode="single"
                                  selectedKeys={selectedKeys}
                                  onSelectionChange={(selectedKeys) => {
                                    setSelectedKeys(selectedKeys);
                                    handleLabelChange(selectedKeys);
                                  }}
                                >
                                  {labels.map((item) => (
                                    <DropdownItem
                                      className="w-full"
                                      key={item.name}
                                      style={{ backgroundColor: item.color }}
                                      value={item.name}
                                    >
                                      {item.name}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </DropdownItem>
                        </DropdownSection>
                      </DropdownMenu>
                    )}
                  </Dropdown>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
