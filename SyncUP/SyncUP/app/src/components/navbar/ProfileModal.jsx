import Chip from "@mui/material/Chip";
import {
  Avatar,
  Box,
  InputBase,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Badge from "@mui/material/Badge";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { User, updateProfile, labels, updateUser } from "@/server/user";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import HighlightOff from "@mui/icons-material/HighlightOff";

import bcrypt from "bcryptjs";
import { GifBox } from "@mui/icons-material";
export default function ProfileModal(props) {
  const { handleCloseModal } = props;
  const [openm, setOpenm] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordEditMode, setIsPasswordEditMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("********");
  const [newPassword, setNewPassword] = useState("");
  const [data, setData] = useState("");
  const { data: session } = useSession();
  const userEmail = session.user.email;
  const [image, setImage] = useState("");
  const [label, setLabels] = useState("");
  const [load, setLoad] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [alert, setAlert]=useState(false)
  const [files, setFiles] = useState(0);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePasswordEditButtonClick = () => {
    setIsPasswordEditMode(true);
  };

  useEffect(() => {
    async function fetchData() {
      if (image !== image.photo) {
        setLoad(true);
      }
      try {
        const userData = await User({ userEmail });
        setData(userData);
        setImage(userData);
        setLabels(userData.boards.map((board) => board.name));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchData();
    setLoad(false);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoad(true);
        const userData = await User({ userEmail });
        setImage(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchData();
    setLoad(false);
  }, [image]);

  const handleEditButtonClick = (e) => {
    e.preventDefault();
    setIsEditMode(true);
  };

  const handleFieldChange = (field, value) => {
    setData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const validatePassword = (password) => {
    const hasMinimumLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(
      password
    );

    if (
      hasMinimumLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialCharacter
    ) {
      return null;
    } else if (
      !hasMinimumLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialCharacter
    ) {
      return "Enter strong password atleast 8 character";
    } else {
      return "password should contain atleast one uppercase, lowercase letter, number and special character";
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setPasswordError(passwordError);
        return;
      }

      const hashedPassword = bcrypt.hashSync(
        newPassword,
        parseInt(process.env.BCRYPT_SALT)
      );
      await updateUser({
        name: data.name,
        role: data.role,
        phone: data.phone,
        password: hashedPassword,
        userEmail,
      });
      setIsPasswordEditMode(false);
      setNewPassword("");
      console.error("Updated the password:");
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleUpdateDetails = async () => {
    if (
      !data.name ||
      data.name.trim() === "" ||
      !data.phone ||
      data.phone.trim() === ""
    ) {
      setSnackbarOpen(true);
      setIsEditMode(true);
    } else {
      try {
        if (
          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
            data.phone
          )
        ) {
          await updateUser({
            name: data.name,
            role: data.role,
            phone: data.phone,
            password: data.password,
            userEmail,
          });
          setData((prevData) => ({
            ...prevData,
            phone: data.phone,
          }));
          setIsEditMode(false);
        } else {
          setSnackbarOpen(true);
          return;
        }
      } catch (error) {
        console.error("Error updating details:", error);
      }
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      if (
        !data.name ||
        data.name.trim() === "" ||
        !data.phone ||
        data.phone.trim() === ""
      ) {
        setSnackbarOpen(true);
        return;
      }
      await handleUpdateDetails();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoad(true);
    if (file.size < 1024 * 1024) {
      setFiles(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        await updateProfile({imagePath: reader.result, userEmail});
      };
      setAlert(false);
    } else {
      setAlert(true);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Modal 
      open={openm}
      onClose={() => {
        handleCloseModal();
        setOpenm(false);
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        className="bg-white rounded-lg shadow-lg flex flex-col lg:flex-row w-full max-w-xl max-h-screen overflow-y-auto relative dark:bg"
        style={{ width: "45%", height: "full" }}
      >
        <Box
          sx={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 1 }}
        >
          <IconButton aria-label="close" onClick={handleCloseModal}>
            <CloseIcon  className="dark:text-white"/>
          </IconButton>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message="Name/phone is not valid."
          anchorOrigin={{
            vertical: "center",
            horizontal: "center",
            color: "red",
          }}
        />
        <Box className="bg-gradient-to-r from-[#b9abdb] to-[#ede7f6] dark:bg-gradient-to-r from-800 to-900 pt-12 pl-6 pr-6 flex-grow max ">
          <Box className="mx-auto mt-8 w-16 h-16 relative">
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <label
                  htmlFor="profile-image"
                  className="cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AddIcon
                    className="absolute bottom-0 right-1 z-10 text-[#7754bd] bg-[#ede7f6] rounded-full"
                    style={{ fontSize: 16 }}
                  />
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              }
            >
              {image && image.photo ? (
                load ? (
                  <CircularProgress style={{ color: "#683ab7" }} size={70}>
                    <Avatar
                      alt="User profile"
                      src={image.photo}
                      className="w-16 h-16"
                    />
                  </CircularProgress>
                ) : (
                  <Avatar
                    alt="User profile"
                    src={image.photo}
                    className="w-16 h-16"
                  />
                )
              ) : load ? (
                <CircularProgress style={{ color: "#683ab7" }} size={70}>
                  <Avatar className="w-16 h-16">
                    {session?.user?.email.slice()[0].toUpperCase()}
                  </Avatar>
                </CircularProgress>
              ) : (
                <Avatar className="w-16 h-16">
                  {session?.user?.email.slice()[0].toUpperCase()}
                </Avatar>
              )}
            </Badge>
          </Box>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{
              fontSize: "0.9rem",
              color: "#683ab7",
              textAlign: "center",
              fontWeight: "600",
              marginTop: "1rem",
              marginLeft: "auto",
              marginRight: "auto",
              wordWrap: "break-word",
              maxWidth: "150px",
            }}
          >
            {isEditMode ? (
              <InputBase
                autoFocus
                value={data.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={(e) => {
                  if (e.relatedTarget && e.relatedTarget.id === "phone") {
                    return;
                  }
                  if (
                    !data.name ||
                    data.name.trim() === "" ||
                    !data.phone ||
                    data.phone.trim() === ""
                  ) {
                    setSnackbarOpen(true);
                    setIsEditMode(true);
                    return;
                  }
                  handleUpdateDetails();
                  setIsEditMode(false);
                }}
                sx={{
                  fontSize: "0.9rem",
                  color: "#683ab7",
                  justifyContent: "center",
                  textAlign: "center",
                  borderBottom: "1px solid #683ab7",
                  display: "inline-block",
                  maxWidth: "90px",
                  marginX: "auto",
                  paddingBottom: "2px",
                }}
              />
            ) : (
              <span>{data.name}</span>
            )}
          </Typography>
          <Typography
            variant="subtitle2"
            className="text-center mt-2"
            sx={{
              fontSize: "0.9rem",
              color: "#683ab7",
            }}
          >
            <span>{data.role}</span>
          </Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "auto",
            }}
          >
            <IconButton
              aria-label="edit profile"
              className="block mx-auto mt-4 text-center dark:text-text"
              onClick={(e) => handleEditButtonClick(e)}
            >
              <svg
                className="h-4 w-4 mx-auto text-[#683ab7]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </IconButton>
          </div>
        </Box>

        <Box className="w-full lg:w-2/3 pl-8 pr-8 pt-8 pb-8 relative">
          <Typography
            variant="h6"
            component="h2"
            className="mb-4 border-b border-[#683ab7] text-lg font-semibold"
          >
            Information
          </Typography>
          <Box className="flex flex-col lg:flex-row justify-between mb-3">
            <Box>
              <Typography variant="subtitle1" className="text-sm font-semibold">
                Email
              </Typography>
              <Typography
                variant="body1"
                className="text-gray-600 dark:text-text"
                sx={{
                  marginRight: "0.5rem",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  maxWidth: "150px",
                }}
              >
                {data.email}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" className="text-sm font-semibold">
                Phone
              </Typography>
              {isEditMode ? (
                <InputBase
                  id="phone"
                  value={data.phone}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditMode(true);
                  }}
                  onBlur={(e) => {
                    if (e.relatedTarget && e.relatedTarget.id === "name") {
                      return;
                    }
                    if (
                      !data.name ||
                      data.name.trim() === "" ||
                      !data.phone ||
                      data.phone.trim() === ""
                    ) {
                      setSnackbarOpen(true);
                      setIsEditMode(true);
                      return;
                    }
                    handleUpdateDetails();
                    setIsEditMode(false);
                  }}
                  onChange={(e) => {
                    if (e.target.value.length < 15)
                      handleFieldChange("phone", e.target.value);
                  }}
                  placeholder="Enter phone"
                  
                  className="text-base dark:text-text dark:border-white border-b-1 justify-center text-center w-full max-w-140"
                  endAdornment={
                    <>
                      {data.phone &&
                      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
                        data.phone
                      ) ? (
                        <CheckCircleOutline
                          style={{ color: "green", fontSize: "1rem" }}
                        />
                      ) : (
                        <HighlightOff
                          style={{ color: "red", fontSize: "1rem" }}
                        />
                      )}
                    </>
                  }
                />
              ) : (
                <Typography
                  variant="body1"
                  className="text-gray-600 dark:text-text"
                  sx={{ marginRight: "0.5rem" }}
                >
                  {data.phone}
                </Typography>
              )}
              {!data.phone ||
                (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
                  data.phone
                ) && (
                  <Typography
                    variant="body2"
                    color="error"
                    align="left"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    Invalid phone
                  </Typography>
                ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              paddingBottom: "5%",
            }}
          >
            <Typography
              variant="subtitle1"
              className="text-sm font-semibold pr-3"
            >
              Password
            </Typography>
            {isPasswordEditMode ? (
              <InputBase
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={handleUpdatePassword}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                
                className="text-xs md:text-sm border-b-1 border-black dark:border-white dark:text-text pl-1 pb-0 justify-center text-center w-full max-w-140"
              />
            ) : (
              <>
                <Typography
                  variant="body1"
                  className="text-gray-600"
                  sx={{ marginLeft: "0.5rem", borderBottom: "1px solid #ccc" }}
                >
                  {currentPassword}
                </Typography>
                <IconButton
                  aria-label="edit password"
                  onClick={() => handlePasswordEditButtonClick(true)}
                  sx={{ ml: 2 }}
                >
                  <svg
                    className="h-4 w-4 mx-auto text-black dark:text-text"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </IconButton>
              </>
            )}
          </Box>
          {isPasswordEditMode && passwordError && (
            <Box
              style={{
                width: "100%",
                textAlign: "center",
                paddingBottom: "10px",
              }}
            >
              <Alert
                variant="outlined"
                severity="error"
                sx={{
                  border: "none",
                  marginTop: "0.2rem",
                  padding: 0,
                  fontSize: "0.8rem",
                }}
              >
                {passwordError}
              </Alert>
            </Box>
          )}

          <Typography
            variant="h6"
            component="h2"
            className="mb-4 border-b border-[#683ab7] text-lg font-semibold"
          >
            Boards
          </Typography>
          <Box
            className="flex flex-wrap no-scrollbar"
            style={{
              maxHeight: "200px",
              minHeight: "110px",
              overflowY: "scroll",
              width: "100%",
            }}
          >
            {Array.isArray(label) &&
              label.map((label, index) => (
                <Chip
                  key={index}
                  label={label}
                  className="m-1"
                  style={{
                    backgroundColor: "#7754bd",
                    color: "white",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    fontSize: "14px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                />
              ))}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
