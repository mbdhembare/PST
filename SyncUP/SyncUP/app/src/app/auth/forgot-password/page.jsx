"use client";
import { forgotPassword } from "../../../lib/actions/authActions";
import { Button, Input, Link } from "@nextui-org/react";
import { MdRotateLeft } from "react-icons/md";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import appConfig from "@/app.config";
const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const submitRequest = async (data) => {
    try {
      await forgotPassword(data.email);
      toast.success("Reset password link was sent to your email.");
      reset();
    } catch (e) {
      if (e.message === "The User Does Not Exist!") {
        toast.error("No user found with the provided email address.");
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{ backgroundColor: "#eef2f6", minHeight: "100vh", width: "100vw" }}
    >
      <div className="md:w-2/6 p-6 space-y-4 md:space-y-6 bg-gray-50 rounded-md">
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
            Forgot password?
          </div>
          <p
            className="text-center mb-4 mt-3"
            style={{ fontFamily: "Roboto", color: "#697586" }}
          >
            Enter your email address below and we'll send you password reset
            email.
          </p>
        </div>
        <form
          className="space-y-4 md:space-y-6"
          onSubmit={handleSubmit(submitRequest)}
        >
          <Input
            label="Email"
            variant="bordered"
            {...register("email", { required: "Email is required" })}
            errorMessage={errors.email?.message}
          />
          <Button
            isLoading={isSubmitting}
            type="submit"
            disabled={isSubmitting}
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
            {isSubmitting ? "Please Wait..." : "Submit"}
          </Button>
          <div
            variant="body2"
            color="textSecondary"
            align="center"
            style={{ marginTop: "1em" }}
          >
            Remember your password?{" "}
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
  );
};

export default ForgotPasswordPage;
