import React, { useEffect, useMemo, useState } from "react";
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
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Payment from "./Payment";
import useUserRole from "../hooks/useUserRole";
import { Settlement } from "../types";

const History = () => {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSettlement, setSelectedSettlement] =
    useState<Settlement | null>(null);
  const [open, setOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const { role, loading } = useUserRole();

  const filteredSettlements = useMemo(() => {
    if (statusFilter === "all") {
      return settlements;
    }
    return settlements.filter((s) => s.status === statusFilter);
  }, [statusFilter, settlements]);

  useEffect(() => {
    if (!user || loading) return;
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
        } catch (error) {
          console.error("Firestore データ取得エラー: ", error);
        }
      }
    };
    fetchSettlements();
  }, [user, role, loading]);

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const handleOpenModal = async (settlement: Settlement) => {
    try {
      const docRef = doc(db, "settlements", settlement.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSelectedSettlement({
          id: docSnap.id,
          ...docSnap.data(),
        } as Settlement);
      } else {
        setSelectedSettlement(settlement);
      }
      setEditable(
        settlement.status === "編集中" || settlement.status === "差し戻し"
      );
      setOpen(true);
    } catch (error) {
      console.log("❌ Firestore データ取得エラー:", error);
    }
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
              setSelectedSettlement={setSelectedSettlement}
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
