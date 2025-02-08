import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  MenuItem,
  Select,
  Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ReceiptUpload from "../components/ReceiptUpload";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

type Expense = {
  date: string;
  vendor: string;
  description: string;
  category: string;
  subcategory: string;
  amount: string;
  currency: string;
  receipt: string | null;
  fileName: string | null;
};

type Settlement = {
  id: string;
  projectName: string;
  startDate: string;
  endDate: string;
  status: string;
  expenses: Expense[];
};

const Payment = ({
  selectedSettlement,
  isEditable,
}: {
  selectedSettlement?: Settlement;
  isEditable: boolean;
}) => {
  const db = getFirestore();

  const [projectName, setProjectName] = useState(selectedSettlement?.projectName || "");
  const [startDate, setStartDate] = useState(selectedSettlement?.startDate || "");
  const [endDate, setEndDate] = useState(selectedSettlement?.endDate || "");
  const [expenses, setExpenses] = useState<Expense[]>(selectedSettlement?.expenses || []);

  useEffect(() => {
    if (selectedSettlement) {
      setProjectName(selectedSettlement.projectName);
      setStartDate(selectedSettlement.startDate);
      setEndDate(selectedSettlement.endDate);
      setExpenses(selectedSettlement.expenses);
    }
  }, [selectedSettlement]);

  const handleExpenseChange = (index: number, field: keyof Expense, value: string) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setExpenses(updatedExpenses);
  };

  const handleSaveEdit = async () => {
    if (!selectedSettlement) return;
    try {
      await updateDoc(doc(db, "settlements", selectedSettlement.id), {
        projectName,
        startDate,
        endDate,
        expenses,
      });
      alert("変更を保存しました");
    } catch (error) {
      console.error("更新エラー:", error);
      alert("変更を保存できませんでした");
    }
  };

  return (
    <Box sx={{ maxWidth: "700px", margin: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        申請情報
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="プロジェクト名"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
            disabled={!isEditable}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="事業開始日"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            disabled={!isEditable}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="事業終了日"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            disabled={!isEditable}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 3 }}>
        経費一覧
      </Typography>

      <List>
        {expenses.map((expense, index) => (
          <ListItem key={index}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  label="日付"
                  type="date"
                  value={expense.date}
                  onChange={(e) => handleExpenseChange(index, "date", e.target.value)}
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="取引先"
                  value={expense.vendor}
                  onChange={(e) => handleExpenseChange(index, "vendor", e.target.value)}
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="支出額"
                  type="number"
                  value={expense.amount}
                  onChange={(e) => handleExpenseChange(index, "amount", e.target.value)}
                  fullWidth
                  disabled={!isEditable}
                />
              </Grid>
              <Grid item xs={3}>
                {expense.receipt && (
                  <a href={expense.receipt} target="_blank" rel="noopener noreferrer">
                    {expense.fileName || "証票を表示"}
                  </a>
                )}
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>

      {isEditable && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button variant="contained" onClick={handleSaveEdit}>
            保存
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Payment;
