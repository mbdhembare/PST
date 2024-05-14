"use client"

/* eslint-disable  import/extensions,  import/no-unresolved,  no-console, no-useless-escape, no-shadow, no-empty ,react/react-in-jsx-scope, react/jsx-props-no-spreading,@typescript-eslint/no-unused-vars */
import { useState } from "react"
import { Button, Input, Link } from "@nextui-org/react"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import { MdRotateLeft } from "react-icons/md"
import { resetPassword } from "@/src/lib/actions/authActions"
import appConfig from "@/app.config"

interface Props {
  jwtUserId: string
}

function ResetPasswordForm({ jwtUserId }: Props) {
  const [mode, setMode] = useState("close")
  const [passwordError, setPasswordError] = useState(null)

  const toggleMode = (event) => {
    event.preventDefault()
    setMode((prevMode) => (prevMode === "close" ? "open" : "close"))
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm()

  const validatePassword = (password) => {
    if (!password) return null
    const hasMinimumLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(
      password,
    )

    if (
      hasMinimumLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialCharacter
    ) {
      return null
    }
    if (
      !hasMinimumLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialCharacter
    ) {
      return "Enter strong password atleast 8 character"
    }
    return "password should contain atleast one uppercase, lowercase letter, number and special character"
  }

  const resetPass = async () => {
    const data = getValues()
    const passwordError = validatePassword(data.password)
    setPasswordError(passwordError)

    if (passwordError || data.password !== data.confirmPassword) {
      if (passwordError) {
      } else {
        setPasswordError("Password does not match")
      }
      return
    }

    try {
      const result = await resetPassword(jwtUserId, data.password)
      if (result === "success") {
        toast.success("Your password has been reset successfully!")
      } else {
        toast.error("Something went wrong while resetting your password.")
      }
    } catch (err) {
      toast.error("Something went wrong!")
      console.error(err)
    }
  }

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
            style={{ fontSize: "22px", fontFamily: "Roboto" }}
          >
            {appConfig.PROJECT_NAME}
          </h2>
        </div>
        <div className="items-center">
          <div
            className="text-center mb-3 font-bold "
            style={{ fontFamily: "Roboto", color: "#673AB7", fontSize: "24px" }}
          >
            Reset Password
          </div>
          <p
            className="text-center mb-4 mt-3"
            style={{ fontFamily: "Roboto", color: "#697586" }}
          >
            Enter your new password below.
          </p>
        </div>
        <form
          className="space-y-4 md:space-y-6"
          onSubmit={handleSubmit(resetPass)}
        >
          <Input
            type={mode === "close" ? "password" : "text"}
            label="Password"
            variant="bordered"
            {...register("password")}
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
          <Input
            type={mode === "close" ? "password" : "text"}
            variant="bordered"
            label="Confirm Password"
            {...register("confirmPassword")}
          />
          {passwordError && (
            <p className="mt-0 text-small text-red-500 ">{passwordError}</p>
          )}
          <Button
            isLoading={isSubmitting}
            type="submit"
            disabled={isSubmitting}
            fullWidth
            className="font-bold text-white transition duration-300 ease-in-out hover:bg-purple-900 hover:text-white hover:shadow-lg"
            style={{
              borderRadius: "none",
              marginTop: "1em",
              backgroundColor: "#673AB7",
            }}
          >
            {isSubmitting ? "Please Wait..." : "Reset Password"}
          </Button>
          <div
            style={{
              marginTop: "1em",
              textAlign: "center",
              color: "textSecondary",
            }}
          >
            Go to{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:underline dark:text-cyan-500"
              style={{ color: "#673AB7" }}
            >
              Log In
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
  )
}

export default ResetPasswordForm
