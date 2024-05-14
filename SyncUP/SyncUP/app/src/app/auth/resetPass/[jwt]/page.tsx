/* eslint-disable  import/extensions,  import/no-unresolved,  react/react-in-jsx-scope */
import ResetPasswordForm from "../../ResetPasswordForm"
import { verifyJwt } from "@/src/lib/jwt"

interface Props {
  params: {
    jwt: string
  }
}

function ResetPasswordPage({ params }: Props) {
  const payload = verifyJwt(params.jwt)
  if (!payload)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-2xl">
        The URL is not valid!
      </div>
    )
  return (
    <div className="flex justify-center">
      <ResetPasswordForm jwtUserId={params.jwt} />
    </div>
  )
}

export default ResetPasswordPage
