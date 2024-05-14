"use client";
import React, { useState, useEffect, useRef } from "react";
import NotificationModal from "../notification/Notification";
import ProfileModal from "./ProfileModal";
import { User as ServerUser } from "@/server/user";
import {
  Navbar,
  NavbarContent,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  User as NextUIUser,
  Badge,
} from "@nextui-org/react";
import {ThemeSwitcher} from "../ThemeSwitcher";
import { BiRotateLeft } from "react-icons/bi";
import { FaQuestion } from "react-icons/fa6";
import { LuBell } from "react-icons/lu";
import { MdOutlineLogout } from "react-icons/md";
import { useSession } from "next-auth/react";
import { fetchNotifications } from "../notification/NotificationData";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import appConfig from "@/app.config";
export default function App() {
  const notificationIconRef = useRef();
  const { data: session, status } = useSession();
  const [data, setData] = useState("");
  const [animationStarted, setAnimationStarted] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [openNotificationModal, setOpenNotificationModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [isSmallScreen, setIsScreenSmall] = useState(false);
  const userEmail = session?.user?.email;

  useEffect(() => {
    setAnimationStarted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSmall(window.innerWidth < 600);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (status != "loading" && !session?.user?.email.length) {
      router.push("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    const fetchAndSetUnreadNotifications = async () => {
      try {
        const notifications = await fetchNotifications(undefined,userEmail);
        setUnreadNotifications(notifications.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchAndSetUnreadNotifications();
  }, [openNotificationModal]);

  useEffect(() => {
    if (userEmail) {
      async function fetchData() {
        try {
          const userData = await ServerUser({ userEmail });

          setData(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      fetchData();
      
    }
  }, [data, userEmail]);

  const handleOpenNotificationModal = () => {
    setOpenNotificationModal(true);
  };

  const handleCloseNotificationModal = () => {
    setOpenNotificationModal(false);
  };

  const handleMenuItemClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleHelpSupport = () => {
    router.push("/helpsupport");
  };
  return (
    <Navbar maxWidth="full">
       <div className="flex justify-between items-center">
    <Link href="/" className="flex justify-center items-center">
      <BiRotateLeft
        style={{
          transform: animationStarted ? "rotate(0deg)" : "rotate(-60deg)",
          color: "#7754bd",
          fontSize: "2.5rem",
          transition: "transform 1s ease",
          marginRight: "8px",
        }}
      />
      <p className="mr-5 hidden md:flex font-sans font-medium text-2xl">
      {appConfig.PROJECT_NAME}
      </p>
    </Link>
    <div className="flex gap-1 items-center">
      <Button className="text-[#7754bd] bg-[#ede7f6] hover:bg-[#683ab7] hover:text-white">
        Home
      </Button>
      <Button className="text-[#7754bd] bg-[#ede7f6] hover:bg-[#683ab7] hover:text-white">
        Project
      </Button>
    </div>
  </div>
      <NavbarContent as="div" justify="end">
        <div className="flex gap-1 items-center">
          {!isSmallScreen && (
            <><ThemeSwitcher />
            <Button
              isIconOnly
              className="text-[#7754bd] bg-[#ede7f6] hover:bg-[#683ab7] hover:text-white dark:bg-700 dark:text"
              size="md"
              onClick={handleHelpSupport}
              title="help&Support"
            >
              <FaQuestion className="text-xl" />
            </Button></>
          )}
          {unreadNotifications > 0 ? (
            <Badge content={unreadNotifications} color="danger">
              <Button
                isIconOnly
                className="text-[#7754bd] bg-[#ede7f6] hover:bg-[#683ab7] hover:text-white dark:bg-700 dark:text"
                size="md"
                ref={notificationIconRef}
                onClick={handleOpenNotificationModal}
                title="Notification"
              >
                <LuBell className="text-xl" />
              </Button>
            </Badge>
          ) : (
            <Button
              isIconOnly
              className="text-[#7754bd] bg-[#ede7f6] hover:bg-[#683ab7] hover:text-white dark:bg-700 dark:text"
              size="md"
              ref={notificationIconRef}
              onClick={handleOpenNotificationModal}
            >
              <LuBell className="text-xl" />
            </Button>
          )}
        </div>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            {data && data.photo ? (
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                size="sm"
                src={data.photo}
              />
            ) : (
              <Avatar
                isBordered
                as="button"
                className="transition-transform text-xl dark:bg-700 dark:text"
                name={session?.user?.email.slice()[0].toUpperCase()}
                size="sm"
              />
            )}
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profile Actions"
            variant="flat"
            color="secondary"
          >
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{session?.user?.email}</p>
            </DropdownItem>
            <DropdownItem key="settings" onClick={handleMenuItemClick}>
              {data && data.photo ? (
                <NextUIUser
                  name="Profile"
                  avatarProps={{
                    src: data.photo,
                    size: "sm",
                  }}
                />
              ) : (
                <NextUIUser
                  name="Profile"
                  avatarProps={{
                    name: session?.user?.email.slice()[0].toUpperCase(),
                    size: "sm",
                  }}
                />
              )}
            </DropdownItem>
            {isSmallScreen && (
              <DropdownItem key="help_and_feedback" onClick={handleHelpSupport}>
                <div className="flex gap-1 items-center">
                  <FaQuestion className="ml-1 text-2xl" />
                  <span className="ml-2">Help & Support</span>
                </div>
              </DropdownItem>
            )}
            <DropdownItem key="logout" color="danger" onClick={handleLogout}>
              <div className="flex gap-1 items-center">
                <MdOutlineLogout className="ml-1 text-2xl" />
                <span className="ml-2">Logout</span>
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
      {isModalOpen && (
        <ProfileModal handleCloseModal={handleCloseModal} opens={isModalOpen} />
      )}
      <NotificationModal
        open={openNotificationModal}
        handleClose={handleCloseNotificationModal}
        anchorEl={notificationIconRef.current}
      />
    </Navbar>
  );
}