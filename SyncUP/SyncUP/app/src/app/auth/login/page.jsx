"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Input, Button } from "@nextui-org/react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdRotateLeft } from "react-icons/md";
import { signIn } from "next-auth/react";
import LoginValidation from "@/server/LoginValidation";
import bcrypt from "bcryptjs";
import appConfig from "@/app.config";
const LoginForm = () => {
  const [mode, setMode] = useState("close");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const toggleMode = (event) => {
    event.preventDefault();
    setMode((prevMode) => (prevMode === "close" ? "open" : "close"));
  };

  const loginWithGoogle = async () => {
    await signIn("google", { callbackUrl: "/home" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await LoginValidation({ email });
      if (!user) {
        setError("User with this email doesnt exists");
        return error;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        setError("Invalid Password");
        return error;
      }

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/home",
      });

      if (result.error) {
      }
    } catch (error) {}
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{ backgroundColor: "#eef2f6", minHeight: "100vh", width: "100vw" }}
    >
      <div className="md:w-1/3 p-6 space-y-4 md:space-y-6 bg-gray-50 rounded-md">
        <div className="text-center mb-8 flex items-center justify-center">
          <MdRotateLeft style={{ color: "#673AB7", fontSize: "2rem" }} />
          <h2
            className="text-3xl font-bold text-black ml-1"
            style={{ fontSize: "24px", fontFamily: "Roboto" }}
          >
              {appConfig.PROJECT_NAME}
          </h2>
        </div>
        <div>
          <div
            className="text-center mb-3 font-bold "
            style={{ fontFamily: "Roboto", color: "#673AB7", fontSize: "24px" }}
          >
            Hi, Welcome Back
          </div>
          <div
            className="text-center mb-4"
            style={{ fontFamily: "Roboto", color: "#697586" }}
          >
            Enter your credentials to continue
          </div>
        </div>
        <div className="flex justify-center items-center sm:px-0 max-w-full">
          <button
            className="w-full flex items-center justify-center mx-2 bg-gray-100 border border-gray-300 rounded-md p-2 focus:outline-none transition duration-300 ease-in-out hover:bg-gray-200 hover:shadow-md"
            onClick={loginWithGoogle}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google Logo"
              className="w-6 h-6 mr-2"
            />
            <span className="text-sm font-medium dark:text-black">Log In with Google</span>
          </button>
        </div>
        <div className="flex items-center justify-center mt-4">
          <div className="w-full border-t border-gray-300"></div>
          <div className="px-2 text-sm text-gray-500">or</div>
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-100 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <div className="flex flex-col space-y-4  ">
            <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
              <Input
                isRequired
                id="email"
                label="Email"
                variant="bordered"
                placeholder="Enter your email"
                value={email}
                className="dark:text-black"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex w-full flex-wrap md:flex-nowrap gap-4 dark:text-black">
              <Input
                type={mode === "close" ? "password" : "text"}
                isRequired
                id="password"
                label="Password"
                variant="bordered"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:text-black"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={(e) => toggleMode(e)}
                  >
                    {mode === "close" ? (
                      <IoMdEyeOff className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <IoMdEye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>
            <div className="text-sm text-gray-500 text-right mt-2 cursor-pointer">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary-600 hover:underline dark:text-cyan-500"
                style={{ color: "#673AB7" }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            className="font-bold text-white transition duration-300 ease-in-out hover:bg-purple-900 hover:text-white hover:shadow-lg fontSize:'15px"
            style={{
              borderRadius: "none",
              marginTop: "1em",
              backgroundColor: "#673AB7",
            }}
          >
            Log In
          </Button>
          <div
            variant="body2"
            color="textSecondary"
            align="center"
            style={{ marginTop: "1em" }}
          >
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary-600 hover:underline dark:text-cyan-500"
              style={{ color: "#673AB7" }}
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
