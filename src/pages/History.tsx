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
import Payment from "./Payment";
import useUserRole from "../hooks/useUserRole";

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
  applicantName: string;
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
  const [editable, setEditable] = useState(false);
  const { role, loading } = useUserRole();

  useEffect(() => {
    if (!user) return;
    const fetchSettlements = async () => {
      if (role === "admin") {
        try {
          const querySnapshot = await getDocs(collection(db, "settlements"));
          const settlementsData: Settlement[] = querySnapshot.docs.map(
            (doc) => {
              const data = doc.data() as Omit<Settlement, "id">;
              return { id: doc.id, ...data };
            }
          );
          setSettlements(settlementsData);
          setFilteredSettlements(settlementsData);
        } catch (error) {
          console.error("Admin Firestore データ取得エラー: ", error);
        }
      } else {
        try {
          const q = query(
            collection(db, "settlements"),
            where("applicantId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const settlementsData: Settlement[] = querySnapshot.docs.map(
            (doc) => {
              const data = doc.data() as Omit<Settlement, "id">;
              return { id: doc.id, ...data };
            }
          );
          setSettlements(settlementsData);
          setFilteredSettlements(settlementsData);
        } catch (error) {
          console.error("Firestore データ取得エラー: ", error);
        }
      }
    };
    fetchSettlements();
  }, [user, db, settlements]);

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
    setSelectedSettlement({ ...settlement });
    setEditable(settlement.status === "編集中" || settlement.status === "却下");
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
                secondary={
                  <>
                    {role === "admin" && (
                      <Typography variant="body2" color="textSecondary">
                        申請者:{settlement.applicantName}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      申請日: 
                      {new Date(
                        settlement.submittedAt.seconds * 1000
                      ).toLocaleDateString()}
                    </Typography>
                  </>
                }
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

      {/* モーダル */}
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
              isEditable={editable}
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
