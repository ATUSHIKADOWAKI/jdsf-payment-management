import React, { useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Payment from "./Payment"

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
  status: string;
  projectName: string;
  startDate: string;
  endDate: string;
  submittedAt: { seconds: number };
  expenses: Expense[];
};

const History = () => {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [filteredSettlements, setFilteredSettlements] = useState<Settlement[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSettlement, setSelectedSettlement] =
    useState<Settlement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchSettlements = async () => {
      try {
        const q = query(
          collection(db, "settlements"),
          where("applicantId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const settlementsData: Settlement[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, ...data } as Settlement;
        });
        setSettlements(settlementsData);
        setFilteredSettlements(settlementsData);
      } catch (error) {
        console.error("Firestore データ取得エラー: ", error);
      }
    };
    fetchSettlements();
  }, [user, db]);

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    const selectedStatus = event.target.value;
    setStatusFilter(selectedStatus);
    if (selectedStatus === "all") {
      setFilteredSettlements(settlements);
    } else {
      setFilteredSettlements(
        settlements.filter((s) => s.status === selectedStatus)
      );
    }
  };

  const handleOpenModal = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedSettlement(null);
  };

  return (
    <Box sx={{ maxWidth: "800px", margin: "auto", p: 3 }}>
      <Typography variant="h4">申請履歴</Typography>

      {/* フィルタリング */}
      <Select
        value={statusFilter}
        onChange={handleStatusFilterChange}
        sx={{ my: 2 }}
      >
        <MenuItem value="all">すべて</MenuItem>
        <MenuItem value="編集中">編集中</MenuItem>
        <MenuItem value="申請中">申請中</MenuItem>
        <MenuItem value="承認済み">承認済み</MenuItem>
        <MenuItem value="却下">却下</MenuItem>
      </Select>

      {/* 申請一覧 */}
      <List>
        {filteredSettlements.length > 0 ? (
          filteredSettlements.map((settlement) => (
            <ListItem key={settlement.id}>
              <ListItemText
                primary={`${settlement.projectName} - ${settlement.status}`}
                secondary={`申請日: ${new Date(
                  settlement.submittedAt.seconds * 1000
                ).toLocaleDateString()}`}
              />
              <Button
                variant="outlined"
                onClick={() => handleOpenModal(settlement)}
              >
                詳細
              </Button>
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">履歴がありません。</Typography>
        )}
      </List>

      {/* 精算入力ページのモーダル */}
      <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedSettlement?.projectName}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedSettlement && (
            <Payment
              selectedSettlement={selectedSettlement}
              isEditable={selectedSettlement.status === "編集中" || selectedSettlement.status === "却下"}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default History;

