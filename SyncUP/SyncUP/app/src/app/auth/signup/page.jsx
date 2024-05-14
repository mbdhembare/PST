"use client";
import Link from "next/link";
import { Input, Button } from "@nextui-org/react";
import React, { useState } from "react";
import LoginValidation from "@/server/LoginValidation";
import { signIn } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdRotateLeft } from "react-icons/md";
import UserInsert from "@/server/user";
import { useRouter } from "next/navigation";

function SignUp() {
  const [mode, setMode] = useState("close");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const togglemode = (event) => {
    event.preventDefault();
    setMode((prevMode) => (prevMode === "close" ? "open" : "close"));
  };

  const handleKeyPress = (e) => {
    if (e.target.name === "name") {
      if (!/^[a-zA-Z\s']*$/i.test(e.key) || e.key === "'") {
        e.preventDefault();
      }
    }
  };

  const validateName = (name) => {
    if (!name) return null;
    const nameRegex = /^[a-zA-Z]+ [a-zA-Z]+$/;
    if (!nameRegex.test(name)) {
      return "Please enter your full name (first & last name)";
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return null;
    const emailRegex =
      /^[a-z][a-z0-9]*([.-]?[a-z0-9]+)*@[a-z0-9]+([.-]?[a-z0-9]+)*\.[a-z]{2,}$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
  };

  const validatePassword = (password) => {
    if (!password) return null;
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

  const signupwithGoogle = async () => {
    await signIn("google", { callbackUrl: "/home" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setNameError(nameError);
    setEmailError(emailError);
    setPasswordError(passwordError);

    if (nameError || emailError || passwordError) {
      return;
    }

    try {
      const userexist = await LoginValidation({ email });
      if (userexist) {
        setEmailError("User with this email exists");
        return error;
      }
      const user = await UserInsert({ name, email, password });
      setError(null);
      toast.success("Registration successful! You can now log in.");
      setName("");
      setEmail("");
      setPassword("");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/auth/login");
    } catch (error) {
      console.error("Error inserting user:", error);
      setError("Error submitting the form. Please try again.");
      toast.success("Registration failed. Please try again.");
    }
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{ backgroundColor: "#eef2f6", minHeight: "100vh", width: "100vw" }}
    >
      <div className="md:w-4/12 p-6 space-y-4 md:space-y-6 bg-gray-50 rounded-md">
        <div className="text-center mb-8 flex items-center justify-center">
          <MdRotateLeft style={{ color: "#673AB7", fontSize: "2rem" }} />
          <h2
            className="text-3xl font-bold text-black ml-1"
            style={{ fontSize: "24px", fontFamily: "Roboto" }}
          >
            SyncUP
          </h2>
        </div>
        <div className="items-center">
          <div
            variant="h5"
            align="center"
            style={{ fontFamily: "Roboto",color: "#673AB7", fontSize: "24px", fontWeight: "bold" }}
          >
            Sign up
          </div>
          <div
            className="text-center mb-4 mt-2"
            style={{ fontFamily: "Roboto", color: "#697586" }}
          >
            Enter your credentials to continue
          </div>
        </div>
        <div className="flex justify-center items-center sm:px-0 max-w-full">
          <button
            className="w-full flex items-center justify-center mx-2 bg-gray-100 border border-gray-300 rounded-md p-2 focus:outline-none transition duration-300 ease-in-out hover:bg-gray-200 hover:shadow-md"
            onClick={signupwithGoogle}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google Logo"
              className="w-6 h-6 mr-2"
            />
            <span className="text-sm font-medium dark:text-black">Sign Up with Google</span>
          </button>
        </div>
        <div className="flex items-center justify-center mt-4">
          <div className="w-full border-t border-gray-300"></div>
          <div className="px-2 text-sm text-gray-500">or</div>
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              isRequired
              label="Name"
              placeholder="Enter your name"
              type="text"
              id="name"
              name="name"
              variant="bordered"
              value={name}
              className="dark:text-black"
              onChange={(e) => {
                setName(e.target.value);
                setNameError(validateName(e.target.value));
              }}
              onKeyDown={handleKeyPress}
            />
            {nameError && (
              <p className="mt-0 text-small text-red-500 ">{nameError}</p>
            )}
          </div>
          <div>
            <Input
              isRequired
              id="email"
              label="Email"
              variant="bordered"
              placeholder="Enter your email"
              className="dark:text-black"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(validateEmail(e.target.value));
              }}
            />
            {emailError && (
              <p className="mt-0 text-small text-red-500 ">{emailError}</p>
            )}
          </div>
          <div>
            <Input
              type={mode === "close" ? "password" : "text"}
              isRequired
              id="password"
              label="Password"
              variant="bordered"
              placeholder="Enter your password"
              className="dark:text-black"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(validatePassword(e.target.value));
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={(e) => togglemode(e)}
                >
                  {mode === "close" ? (
                    <IoMdEyeOff className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <IoMdEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />
            {passwordError && (
              <p className="mt-0 text-small text-red-500 ">{passwordError}</p>
            )}
          </div>
          {error && (
            <div
              variant="body2"
              color="error"
              align="left"
              style={{ marginTop: "1em", marginBottom: "1em" }}
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            className="font-bold text-white transition duration-300 ease-in-out hover:bg-purple-900 hover:text-white hover:shadow-lg"
            style={{
              borderRadius: "none",
              marginTop: "1em",
              backgroundColor: "#673AB7",
            }}
          >
            Sign Up
          </Button>
          <div
            variant="body2"
            color="textSecondary"
            align="center"
            style={{ marginTop: "1em" }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:underline dark:text-cyan-500"
              style={{ color: "#673AB7" }}
            >
              Log in
            </Link>
          </div>
        </form>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}

export default SignUp;
