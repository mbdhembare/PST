/* eslint-disable camelcase, no-console */
import axios from "axios"

export default async function handler(req, res) {
  const { user_input } = req.body

  try {
    const response = await axios.get("http://localhost:5000/api/chatbot", {
      user_input,
    })

    const { data } = response
    res.status(200).json({ message: data.message })
  } catch (error) {
    console.error("Error during Axios request:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
