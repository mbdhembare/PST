/* eslint-disable  @typescript-eslint/no-unused-vars, import/extensions, import/no-unresolved,  no-use-before-define, no-console, no-shadow */
import { useEffect, useState } from "react"
import { pipe } from "fp-ts/lib/function"
import { useSession } from "next-auth/react"
import { usePathname, useParams } from "next/navigation"
import GetSyncupData from "@/server/GetSyncupData"
import { getAllboards } from "@/server/board"
import { getLabels } from "@/server/label"
import { User } from "@/server/user"

export interface SyncupData {
  id: number
  title: string
  color: string
  cards: {
    attachments: any
    comments: any
    id: number
    name: string
    description: string
    photo: string
    order: number
    dueDate: Date
    isCompleted: boolean
    isBold: boolean
    isItalic: boolean
    assignedUsers: {
      name: string
      email: string
      photo: string
    }[]
    label?: {
      id: number
      name: string
      color: string
    }[]
    tasks: {
      user: string
    }
  }[]
  comments?: {
    id: number
    description: string
  }[]
  attachments?: {
    id: number
  }[]
}
export interface LabelData {
  id: string
  name: string
  color: string
}

export interface BoardData {
  users: any
  id: number
  name: string
  background: string
  visibility: any
}

export interface UserData {
  id: number
  email: string
  name: string
  role: any
}

export interface UseSyncupFilters {
  member: string[]
  data: SyncupData[]
  labels: LabelData[]
  boardData: BoardData[]
  setData: (value: SyncupData[]) => void
  setLabels: (value: LabelData[]) => void
  setBoardData: (value: BoardData[]) => void
  setMember: (value: string[]) => void
  setCardState: (value: string) => void
  setSearchState: (value: string) => void
  searchState: string
  cardState: string
  setFilterState: (value: FilterState) => void
  filterState: FilterState
  setLoad: (value: boolean) => void
  load: boolean
  TableView: boolean
  setTableView: (value: boolean) => void
  categoryLoad: boolean
  setCategoryLoad: (value: boolean) => void
  userInfo: UserData
  setUserInfo: (value: UserData) => void
}

export interface FilterState {
  due: boolean
  dueDate: boolean
  overdue: boolean
  dueNextDay: boolean
  dueNextWeek: boolean
  dueNextMonth: boolean
  label: string
  specificLabel: string
  member: boolean
  assignedToMe: boolean
  isMarkedAsCompleted: boolean
  isMarkedAsInCompleted: boolean
  specificMember: string
}

export function useSyncupFilter(): UseSyncupFilters {
  const [data, setData] = useState<SyncupData[]>()
  const [member, setMember] = useState<string[]>([])
  const [cardState, setCardState] = useState<string | undefined>()
  const [searchState, setSearchState] = useState<string | undefined>()
  const { data: session } = useSession()
  const uemail = session && session.user ? session.user.email : null
  const [load, setLoad] = useState(false)
  const [categoryLoad, setCategoryLoad] = useState(false)
  const [firstBoardID, setfirstboardId] = useState(null)
  const [TableView, setTableView] = useState(false)
  const [labels, setLabels] = useState<LabelData[]>([])
  const [boardData, setBoardData] = useState<BoardData[]>([])
  const [userInfo, setUserInfo] = useState<UserData>()
  const [filterState, setFilterState] = useState<FilterState>({
    due: false,
    dueDate: false,
    overdue: false,
    dueNextDay: false,
    dueNextWeek: false,
    dueNextMonth: false,
    label: "",
    specificLabel: "",
    member: false,
    assignedToMe: false,
    isMarkedAsCompleted: false,
    isMarkedAsInCompleted: false,
    specificMember: "",
  })

  const params = usePathname()
  useEffect(() => {
    const fetchBoards = async () => {
      if (session && session.user) {
        const fetchedBoards = await getAllboards(session.user.email)
        const sortedBoards = fetchedBoards.sort((a, b) => a.id - b.id)
        if (sortedBoards.length > 0) {
          const firstBoard = sortedBoards[0]
          setfirstboardId(firstBoard.id)
        }
      }
    }
    fetchBoards()
  }, [session, params])

  const board = useParams()
  const boardIdToUse = board.id !== undefined ? board.id : firstBoardID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const updatedData = await GetSyncupData(boardIdToUse)
        setData(updatedData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()

    if (boardIdToUse) {
      fetchData()
    }
  }, [boardIdToUse, session])

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userEmail = session.user.email
        const userDetails = await User({ userEmail })
        setUserInfo(userDetails)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    getUserDetails()
  }, [userInfo, session])

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const labelsData = await getLabels()
        setLabels(labelsData)
      } catch (error) {
        console.error("Error fetching labels:", error)
      }
    }

    fetchLabels()
  }, [labels])

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const BoardData = await getAllboards(session.user.email)
        const sortedBoards = BoardData.sort((a, b) => a.id - b.id)
        setBoardData(sortedBoards)
      } catch (error) {
        console.error("Error fetching labels:", error)
      }
    }
    fetchBoardData()
  }, [boardData, session])

  const isOverdue = (dueDate: Date) => {
    const today = new Date()
    return dueDate < today
  }
  const isDueNextDay = (dueDate: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    return (
      dueDate.getFullYear() === tomorrow.getFullYear() &&
      dueDate.getMonth() === tomorrow.getMonth() &&
      dueDate.getDate() === tomorrow.getDate()
    )
  }

  const isDueNextWeek = (dueDate: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oneWeekFromToday = new Date(today)
    oneWeekFromToday.setDate(today.getDate() + 7)

    return dueDate > today && dueDate <= oneWeekFromToday
  }

  const isDueNextMonth = (dueDate: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentMonth = today.getMonth()
    const nextMonth = new Date(today.getFullYear(), currentMonth + 1, 1)
    const monthAfterNext = new Date(today.getFullYear(), currentMonth + 2, 1)

    return dueDate >= nextMonth && dueDate < monthAfterNext
  }

  function applyCheckboxFilters(card: any) {
    return (
      card.label !== undefined &&
      card.label !== "" &&
      (!filterState.dueDate || card.dueDate) &&
      (!filterState.overdue || isOverdue(card.dueDate)) &&
      (!filterState.dueNextDay || isDueNextDay(card.dueDate)) &&
      (!filterState.dueNextWeek || isDueNextWeek(card.dueDate)) &&
      (!filterState.dueNextMonth || isDueNextMonth(card.dueDate)) &&
      (!filterState.label || (card.label && card.label.length > 0)) &&
      (!filterState.specificLabel ||
        card.label.some((label) => label.name === filterState.specificLabel)) &&
      (!filterState.member ||
        (card.assignedUsers && card.assignedUsers.length > 0)) &&
      (!filterState.assignedToMe ||
        card.assignedUsers.some((user) => user.email === uemail)) &&
      (!filterState.isMarkedAsCompleted || card.isCompleted) &&
      (!filterState.isMarkedAsInCompleted || !card.isCompleted) &&
      (!filterState.specificMember ||
        card.assignedUsers.some(
          (user) => user.name === filterState.specificMember,
        ))
    )
  }
  function SearchCardsByTitleLabelMembers<T extends SyncupData>(
    Cards: T[],
  ): T[] {
    return Cards?.map((column) => {
      const filteredCards = column.cards.filter((card) =>
        cardState
          ? card.name.toLowerCase().includes(cardState.toLowerCase()) ||
            card.label.some((label) =>
              label.name.toLowerCase().includes(cardState.toLowerCase()),
            ) ||
            card.assignedUsers.some((user) =>
              user.name.toLowerCase().includes(cardState.toLowerCase()),
            )
          : true,
      )
      return { ...column, cards: filteredCards }
    })
  }

  function SearchCardsByName<T extends SyncupData>(Cards: T[]): T[] {
    return Cards?.map((column) => {
      const filteredCards = column.cards.filter((card) =>
        searchState
          ? card.name.toLowerCase().includes(searchState.toLowerCase())
          : true,
      )
      return { ...column, cards: filteredCards }
    })
  }

  function SearchLabelsByName<T extends LabelData>(labels: T[]): T[] {
    return labels.filter((label) => {
      return searchState
        ? label.name.toLowerCase().includes(searchState.toLowerCase())
        : true
    })
  }

  function SearchBoardByName<T extends BoardData>(boardData: T[]): T[] {
    return boardData.filter((board) => {
      return searchState
        ? board.name.toLowerCase().includes(searchState.toLowerCase())
        : true
    })
  }

  function takeCardsByCheckboxes(data: SyncupData[] | undefined): SyncupData[] {
    if (!data) {
      return []
    }
    return data.map((column) => ({
      ...column,
      cards: column.cards.filter(applyCheckboxFilters),
    }))
  }

  return {
    data: pipe(
      data,
      SearchCardsByTitleLabelMembers,
      takeCardsByCheckboxes,
      SearchCardsByName,
    ),
    labels: pipe(labels, SearchLabelsByName),
    boardData: pipe(boardData, SearchBoardByName),
    setData,
    setLabels,
    searchState,
    setSearchState,
    member,
    setMember,
    setCardState,
    setFilterState,
    filterState,
    cardState,
    setLoad,
    load,
    TableView,
    setTableView,
    categoryLoad,
    setCategoryLoad,
    setBoardData,
    userInfo,
    setUserInfo,
  }
}
