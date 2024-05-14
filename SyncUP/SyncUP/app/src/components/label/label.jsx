"use client";
/* eslint-disable  @typescript-eslint/no-unused-vars, import/no-extraneous-dependencies */
import TabPanel from "@mui/lab/TabPanel";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LabelInsertModal from "./LabelInsertModal";
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import TabContext from "@mui/lab/TabContext";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Pagination from "@mui/material/Pagination";
import SettingsIcon from "@mui/icons-material/Settings";
// import {Pagination} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import TableContainer from "@mui/material/TableContainer";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import { createLabel, updateLabel, deleteLabel } from "@/server/label";
import { tabClasses } from "@mui/joy/Tab";
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore";

// import {Tabs, Tab, Card, CardBody, CardHeader} from "@nextui-org/react";

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
  marginTop: -theme.spacing(2),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledCreateButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1.8),
  marginBottom: theme.spacing(1),
  color: "#F97316",
  fontSize: "0.8rem",
  borderRadius: "6px",
  borderColor: "#F97316",
  textTransform: "none",
  display: "flex",
  marginLeft: "auto",
  "&:hover": {
    borderColor: "#F97316",
  },
}));

const ScrollableBox = styled(Box)(({ theme }) => ({
  overflowY: "auto",
  maxHeight: "calc(100vh - 300px)",
  width: "100%",
  "&::-webkit-scrollbar": {
    width: "12px",
    height: "12px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: "6px",
  },
  "@media (max-width: 600px)": {
    maxHeight: "3000px",
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
  },
}));

function LabelManagement() {
  const [value, setValue] = useState("1");
  const [currentPage, setCurrentPage] = useState(1);
  const [labelsPerPage] = useState(8);
  const [openInsertModal, setOpenInsertModal] = useState(false);
  const { labels, setLabels } = useGlobalSyncupContext();
  const [editLabel, setEditLabel] = useState(null);
  const [editLabelIndex, setEditLabelIndex] = useState(null);
  const indexOfLastLabel = currentPage * labelsPerPage;
  const indexOfFirstLabel = indexOfLastLabel - labelsPerPage;
  const currentLabels = labels.slice(indexOfFirstLabel, indexOfLastLabel);
  const handleCreateLabelClick = () => {
    setOpenInsertModal(true);
    setEditLabelIndex(null);
    setEditLabel(null);
  };

  const handleInsertLabel = async (labelData) => {
    try {
      if (!labelData.name.trim()) {
        console.error("Label name cannot be empty.");
        return;
      }
      const createdLabel = await createLabel(labelData.name, labelData.color);

      setLabels((prevLabels) => [...prevLabels, createdLabel]);

      setOpenInsertModal(false);
    } catch (error) {
      console.error("Error creating label:", error);
    }
  };

  const handleUpdateLabel = async (labelData) => {
    try {
      if (!labelData.name.trim()) {
        console.error("Label name cannot be empty.");
        return;
      }

      await updateLabel(labelData.id, labelData.name, labelData.color);
      const updatedLabelIndex = labels.findIndex(
        (label) => label.id === labelData.id
      );
      if (updatedLabelIndex !== -1) {
        setLabels((prevLabels) => {
          const updatedLabels = [...prevLabels];
          updatedLabels[updatedLabelIndex] = {
            id: labelData.id,
            name: labelData.name,
            color: labelData.color,
          };
          return updatedLabels;
        });
      }

      setOpenInsertModal(false);
      setEditLabel(null);
      setEditLabelIndex(null);
    } catch (error) {
      console.error("Error updating label:", error);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    try {
      await deleteLabel(labelId);
    } catch (error) {
      console.error("Error deleting label:", error);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="flex w-90vw flex-col mt-4 ml-2 mr-6">
      <TabContext value={value}>
        <Tabs
          aria-label="label management tabs"
          defaultValue={1}
          sx={{ bgcolor: "transparent" }}
          onChange={(event, newValue) => setValue(newValue)}
        >
          <TabList
            disableUnderline
            sx={{
              p: 0.5,
              gap: 0.5,
              borderRadius: "xl",
              bgcolor: "background.level2",
              [`& .${tabClasses.root}[aria-selected="true"]`]: {
                boxShadow: "sm",
                bgcolor: "background.surface",
              },
            }}
          >
            <Tab
              disableIndicator
              value="1"
              key="Label settings"
              title="Label Settings"
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <SettingsIcon sx={{ fontSize: 16, marginRight: 0.5 }} />
                Label Settings
              </div>
            </Tab>
            <Tab
              disableIndicator
              value="2"
              color="black"
              key="Specifications"
              title="Specifications"
            >
              Specifications
            </Tab>
            <Tab
              disableIndicator
              value="3"
              color="black"
              key="Setting 1 "
              title="Setting 2"
            >
              Setting 2
            </Tab>
            <Tab
              disableIndicator
              value="4"
              color="black"
              key="Setting 2"
              title="Setting 3"
            >
              Setting 3
            </Tab>
          </TabList>
        </Tabs>
        {value === "1" && (
          <ScrollableBox>
            <div className="flex flex-row-reverse">
              <Button
                className=" dark:text-700  mt-4 mr-2"
                size="sm"
                color="secondary"
                variant="bordered"
                onClick={handleCreateLabelClick}
              >
                Create label
              </Button>
            </div>

            <TableContainer>
              <Table>
                <TableBody>
                  {currentLabels.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell>
                        <Grid container alignItems="center">
                          <Grid item xs={8} sm={8}>
                            <StyledChip
                              label={label.name}
                              style={{
                                backgroundColor: label.color,
                                color: "black",
                              }}
                            />
                          </Grid>
                          <Grid item xs={4} sm={4} sx={{ textAlign: "right" }}>
                            <IconButton
                              size="small"
                              aria-label="edit"
                              className="mr-6 dark:text-900"
                              onClick={() => {
                                setEditLabel(label);
                                setOpenInsertModal(true);
                              }}
                            >
                              <EditIcon
                                className="text-lg text-gray-700 dark:text-text"
                              />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="delete"
                              
                              onClick={() => {
                                handleDeleteLabel(label.id);
                              }}
                            >
                              <DeleteIcon
                                className="text-lg text-gray-700 dark:text-text"
                              />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className="flex flex-row-reverse ">
              <Pagination
                count={Math.ceil(labels.length / labelsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="secondary"
                showShadow
                sx={{
                  padding: "10px 0",
                   marginLeft: "4px",
                  "& .Mui-selected": {
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.8)",
                  },
                }}
               className="dark:text-text"
              />
            </div>
          </ScrollableBox>
        )}
        <TabPanel value="2">
          <label>This is Specifications Page</label>
        </TabPanel>

        <TabPanel value="3">
          <h2>This is setting 2</h2>
        </TabPanel>

        <TabPanel value="4">
          <h2>This is setting 3</h2>
        </TabPanel>
      </TabContext>
      <LabelInsertModal
        key={openInsertModal ? "insert-modal-open" : "insert-modal-closed"}
        open={openInsertModal}
        onClose={() => setOpenInsertModal(false)}
        onInsert={handleInsertLabel}
        onUpdate={handleUpdateLabel}
        initialData={editLabel}
      />
    </div>
  );
}

export default LabelManagement;
