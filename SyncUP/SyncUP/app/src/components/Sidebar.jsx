"use client";
import * as React from "react";
import { MdOutlineDashboard } from "react-icons/md";
import { FaRegFileLines } from "react-icons/fa6";
import { IoCompassOutline } from "react-icons/io5";
import { LuBarChart } from "react-icons/lu";
import { IoFlashOutline } from "react-icons/io5";
import { RiTeamLine } from "react-icons/ri";
import { MdOutlineSettings } from "react-icons/md";
import { AiOutlineDoubleLeft } from "react-icons/ai";
import { AiOutlineDoubleRight } from "react-icons/ai";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchBoardName, getAllboards } from "@/server/board";


const menuItems = [
  { text: "Board", path: "/board", icon: <MdOutlineDashboard className="w-6 h-6" /> },
  { text: "Backlog", path: "/backlog", icon: <FaRegFileLines className="w-6 h-6" /> },
  { text: "Roadmap", path: "/roadmap", icon: <IoCompassOutline className="w-6 h-6" /> },
  { text: "Report", path: "/report", icon: <LuBarChart className="w-6 h-6" /> },
  { text: "Releases", path: "/releases", icon: <IoFlashOutline className="w-6 h-6" /> },
  { text: "Team", path: "/team", icon: <RiTeamLine className="w-6 h-6" /> },
  { text: "Project Setting", path: "/projectsetting", icon: <MdOutlineSettings className="w-6 h-6" /> },
];

function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const { data: session } = useSession();
  const [boardname, setboardname] = useState("");
  const boardid = useParams();
  useEffect(() => {
    const fetchBoards = async () => {
      if (boardid.id !== undefined) {
        const board = await fetchBoardName(boardid);
        setboardname(board);
      } else {
        if (session && session.user) {
          const fetchedBoards = await getAllboards(session.user.email);
          const sortedBoards = fetchedBoards.sort((a, b) => a.id - b.id);
          if (sortedBoards.length > 0) {
            const firstBoard = sortedBoards[0];
            setboardname(firstBoard.name);
          } else {
            setboardname("Project name");
          }
        }
      }
    };
    fetchBoards();
  });

  const pathname = usePathname();
  const [screenHeight, setScreenHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", updateScreenHeight);
    updateScreenHeight();

    return () => window.removeEventListener("resize", updateScreenHeight);
  }, []);

  useEffect(() => {
    setIsExpanded(isSidebarOpen);
  }, [isSidebarOpen]);

  return (
    <div style={{ height: `${screenHeight}px` }}>
      <div style={{ position: "relative" }}>
        <div className="dark:text"
          style={{
            position: "absolute",
            top: "15%",
            right: "-11px",
            borderRadius: "50%",
            backgroundColor: "#ede7f6",
            transform: "translateY(-50%)",
            zIndex: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            padding: 0,
          }}
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <AiOutlineDoubleLeft className="w-3 h-2" />
          ) : (
            <AiOutlineDoubleRight className="w-3 h-2"  />
          )}
        </div>

        <ul className={`${isSidebarOpen ? "" : "flex flex-col justify-center items-center"}`}>
          <li className="flex items-center p-[0.7rem] mt-1 rounded-lg cursor-pointer">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwhKdsWLbcge24UeYFed6IeLusNnVYe7YV4A&usqp=CAU"
              alt="Project Logo"
              className="w-10 h-10 rounded-lg mr-2"
            />
            {isSidebarOpen && (
              <div className="font-bold text-lg ml-1">{boardname}</div>
            )}
          </li>
          {menuItems.map((item) => (
            
              <li
                key={item.text}
                textValue={item.text}
                variant={"light"}
                className={`p-[0.7rem] mt-1 rounded-lg cursor-pointer hover:text-[#9170ca] hover:bg-[#ede7f6] hover:border-l-4 border-[#9170ca] ${isSidebarOpen ? "mx-1" : ""} ${pathname === item.path ? "text-[#9170ca] bg-[#ede7f6] border-l-4 border-[#9170ca]" : ""}`}
              >
                <Link href={item.path} key={item.text}>
                <div className="flex gap-3 items-center">
                  <div>{item.icon}</div>
                  {isSidebarOpen && (
                    <div className="flex flex-col">
                      <span className="text-small">{item.text}</span>
                    </div>
                  )}
                </div>
                </Link>
              </li>
            
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
