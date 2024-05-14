"use client"

/* eslint-disable  @typescript-eslint/no-unused-vars, import/extensions, import/no-unresolved, react/react-in-jsx-scope, react/jsx-no-constructed-context-values */
/* eslint-disable  @typescript-eslint/no-unused-vars, import/extensions, import/no-unresolved, react/react-in-jsx-scope, react/jsx-no-constructed-context-values */
import { createContext, useContext, Dispatch, SetStateAction } from "react";
import {
  SyncupData,
  useSyncupFilter,
  FilterState,
  LabelData,
  BoardData,
  UserData,
} from "./useSyncupFilters"

interface ContextProps {
  setData: (value: SyncupData[]) => void
  setLabels: (value: LabelData[]) => void
  setBoardData: (value: BoardData[]) => void
  data: SyncupData[]
  labels: LabelData[]
  boardData: BoardData[]
  cardState: string
  TableView: boolean
  setTableView: Dispatch<SetStateAction<boolean>>
  searchState: string
  load: boolean
  categoryLoad: boolean
  setCategoryLoad: Dispatch<SetStateAction<boolean>>
  setLoad: Dispatch<SetStateAction<boolean>>
  setCardState: Dispatch<SetStateAction<string>>
  setSearchState: Dispatch<SetStateAction<string>>
  setFilterState: Dispatch<SetStateAction<FilterState>>
  filterState: FilterState
  userInfo: UserData
  setUserInfo: (value: UserData) => void
}

const SyncupGlobalContext = createContext<ContextProps>({
  setLoad: (): boolean => false,
  labels: [],
  boardData: [],
  load: false,
  TableView: false,
  setTableView: (): boolean => false,
  setCategoryLoad: (): boolean => false,
  categoryLoad: false,
  setData: () => [],
  setLabels: () => [],
  setBoardData: () => [],
  data: [],
  cardState: "",
  searchState: "",
  setSearchState: (): string => "",
  setCardState: (): string => "",
  setFilterState: (): string => "",
  userInfo: {
    id: 0,
    email: "",
    name: "",
    role: "User",
  },
  setUserInfo: () => {},
  filterState: {
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
  },
});

export function SyncupGlobalContextProvider({ children }) {
  const {
    cardState,
    searchState,
    labels,
    setCardState,
    setSearchState,
    filterState,
    setFilterState,
    TableView,
    setTableView,
    data,
    setData,
    setLabels,
    setBoardData,
    setLoad,
    load,
    categoryLoad,
    setCategoryLoad,
    boardData,
    userInfo,
    setUserInfo,
  } = useSyncupFilter()
  return (
    <SyncupGlobalContext.Provider
      value={{
        data,
        labels,
        boardData,
        setBoardData,
        setData,
        setLabels,
        load,
        setLoad,
        TableView,
        setTableView,
        categoryLoad,
        setCategoryLoad,
        cardState,
        searchState,
        setCardState,
        filterState,
        setFilterState,
        setSearchState,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </SyncupGlobalContext.Provider>
  );
}

export const useGlobalSyncupContext = () => useContext(SyncupGlobalContext);
