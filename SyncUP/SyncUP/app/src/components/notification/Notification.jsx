"use client";
/* eslint-disable  import/extensions, import/no-unresolved, no-console*/
import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import { fetchNotifications } from "./NotificationData";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useSession } from "next-auth/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Accordion,
  AccordionItem,
  Divider,
  User,
  Listbox,
  ListboxItem,
  Tabs,
  Tab,
} from "@nextui-org/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import deleteNotification from "./clearAllNotifications";

function NotificationModal({ open, handleClose, anchorEl }) {
  const [notifications, setNotifications] = useState([]);
  const [showListbox, setShowListbox] = useState(false);
  const [selected, setSelected] = React.useState("0");
  const { data: session } = useSession();

  useEffect(() => {
    const lastSeenNotificationId = localStorage.getItem(
      "lastSeenNotificationId"
    );
    const fetchNotificationsData = async () => {
      try {
        const fetchedNotifications = await fetchNotifications(
          lastSeenNotificationId,session?.user?.email
        );
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotificationsData();
  }, [open]);

  const handleCloseModal = () => {
    setNotifications([]);
    handleClose();
  };

  const handleAccordionClick = (notificationId) => {
    localStorage.setItem("lastSeenNotificationId", notificationId);
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, new: false }
          : notification
      )
    );
  };

  const unreadNotifications = notifications.filter(
    (notification) => notification.new
  );

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        new: false,
      }))
    );
  };

  const handleDelete = async () => {
    try {
      await deleteNotification();
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  return (
    <Popover 
      placement="bottom-end"
      offset={22}
      trigger="click"
      isOpen={open}
      onClose={handleCloseModal}
      anchorEl={anchorEl}
    >
      <PopoverTrigger>
        <div />
      </PopoverTrigger>
      <PopoverContent className="dark:bg" >
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
        >
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              marginTop: "12px",
              marginRight: "4px",
            }}
          >
            <NotificationsIcon sx={{ fontSize: "1.8rem", marginRight: 0.5 }} />
            All Notifications:
            <Popover
              placement="bottom-start"
              offset={1}
              trigger="click"
              isOpen={showListbox}
              onClose={() => setShowListbox(false)}
              anchorEl={anchorEl}
            >
              <PopoverTrigger>
                <MoreVertIcon
                  color="primary"
                  sx={{ fontSize: "1.8rem", marginLeft: 12 }}
                  onClick={() => setShowListbox(!showListbox)}
                />
              </PopoverTrigger>
              <PopoverContent>
                <Listbox aria-label="Actions">
                  <ListboxItem
                    key="copy"
                    sx={{ fontSize: "0.1rem" }}
                    onClick={handleMarkAllAsRead}
                  >
                    Mark All as read
                  </ListboxItem>

                  <ListboxItem
                    key="delete"
                    sx={{ fontSize: "0.1rem" }}
                    onClick={handleDelete}
                  >
                    Clear all
                  </ListboxItem>
                </Listbox>
              </PopoverContent>
            </Popover>
          </span>
        </Typography>
        <Tabs
          aria-label="Options"
          selectedKey={selected}
          onSelectionChange={setSelected}
        >
          <Tab key="0" title="All Notifications">
            <div
              style={{
                maxHeight: 400,
                width: 312,
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              <Accordion variant="splitted">
                {notifications.map((notification) => (
                  <AccordionItem
                    title={
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: "1.0rem", p: "-1px" }}
                        className={`text-base ${notification.new ? 'dark:text-700 text-black' : ' dark:text-700 text-black '}`}
                      >
                        {notification.message}
                      </Typography>
                    }
                    key={notification.id}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      marginBottom: "12px",
                      width: "100%",
                      marginBottom: "2px",
                      backgroundColor: notification.new ? "#EDE7F6" : "inherit",
                    }}
                    onClick={() => handleAccordionClick(notification.id)}
                  >
                    <Divider sx={{ my: 2 }} />
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <User
                        avatarProps={{
                          src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                        }}
                      />
                      <div style={{ marginLeft: "12px" }}>
                        <Typography className="dark:text-text"
                          variant="body2"
                          color="textSecondary"
                          sx={{ marginTop: "4px" }}
                        >
                          {format(notification.createdAt, "dd MMM yyyy HH:mm")}
                        </Typography>
                        <Typography variant="body2">
                          {notification.message}
                        </Typography>
                      </div>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Tab>
          <Tab key="1" title="Unread Notifications">
            <div
              style={{
                maxHeight: 400,
                width: 312,
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              <Accordion variant="splitted">
                {unreadNotifications.map((notification) => (
                  <AccordionItem
                    title={
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "1.0rem", p: "-1px" }}
                        className={`text-base ${notification.new ? 'dark:text-700 text-black' : ' dark:text-700 text-black '}`}
                      >
                        {notification.message}
                      </Typography>
                    }
                    key={notification.id}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      marginBottom: "12px",
                      width: "100%",
                      marginBottom: "2px",
                      backgroundColor: "#EDE7F6",
                    }}
                    onClick={() => handleAccordionClick(notification.id)}
                  >
                    <Divider sx={{ my: 2 }} />
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <User
                        avatarProps={{
                          src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                        }}
                      />
                      <div style={{ marginLeft: "12px" }}>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ marginTop: "4px" }}
                        >
                          {format(notification.createdAt, "dd MMM yyyy HH:mm")}
                        </Typography>
                        <Typography variant="body2">
                          {notification.message}
                        </Typography>
                      </div>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Tab>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationModal;
