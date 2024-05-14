/* eslint-disable import/extensions,import/no-unresolved, @typescript-eslint/no-unused-vars,react/react-in-jsx-scope */
import Cards from "@/src/components/cards"

function page(params) {
  const { id } = params.params
  return (
    <div>
      <Cards boardId={id} />
    </div>
  )
}
export default page
