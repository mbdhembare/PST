"use client";
import Cards from "../cards";
import { getAllboards } from "@/server/board";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Paper, Typography } from "@mui/material";
import Link from "next/link";
export default function Home() {
  const { data: session, status } = useSession();
  const [firstBoardId, setFirstBoardId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fetchBoards = async () => {
    try {
      if (session && session.user) {
        const fetchedBoards = await getAllboards(session.user.email);
        const sortedBoards = fetchedBoards.sort((a, b) => a.id - b.id);
        if (sortedBoards.length > 0) {
          const firstBoard = sortedBoards[0];
          setFirstBoardId(firstBoard.id);
        } else {
          setErrorMessage("You don't have any boards. Please create a board.");
        }
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
      setErrorMessage("An error occurred while fetching boards.");
    }
  };
  
  useEffect(() => {
    fetchBoards();
  }, [session]);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "50%" }}>
          {errorMessage ? (
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                backgroundColor: "#FFCCCC",
                margin: "auto",
                textAlign: "center",
              }}
            >
              <Typography color="error">
                {errorMessage}{" "}
                <Link href="/board" passHref>
                  Click here to create a board
                </Link>
              </Typography>
            </Paper>
          ) : null}
        </div>
      </div>

      <div>
        <div>{firstBoardId && <Cards boardId={firstBoardId} />}</div>
      </div>
    </>
  );
}
