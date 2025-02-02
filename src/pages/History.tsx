import React, { useState } from "react";
import { Box, Button, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";

// 精算ページのUIを履歴ページでテスト中
const History = () => {
  const today = new Date().toISOString().split("T")[0];
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // 申請後の編集制限
  const [isSubmitted, setIsSubmitted] = useState(false);

  // コメントの管理（将来的には Firestore へ保存）
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ text: string; role: string; timestamp: string }[]>([]);

  const [expenses, setExpenses] = useState<{ date: string; vendor: string; amount: number | "" }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<{ date: string; vendor: string; amount: number | "" }>({ date: today, vendor: "", amount: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 経費追加・編集用モーダルを開く
  const openModal = (index: number | null = null) => {
    if (index !== null) {
      setCurrentExpense(expenses[index]);
      setEditingIndex(index);
    } else {
      setCurrentExpense({ date: today, vendor: "", amount: "" });
      setEditingIndex(null);
    }
    setIsModalOpen(true);
  };

  // 経費を追加・更新する
  const handleSaveExpense = () => {
    if (editingIndex !== null) {
      const updatedExpenses = [...expenses];
      updatedExpenses[editingIndex] = currentExpense;
      setExpenses(updatedExpenses);
    } else {
      setExpenses([...expenses, currentExpense]);
    }
    setIsModalOpen(false);
  };

  // 経費を削除する
  const handleDeleteExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  // 🆕 コメントを追加する
  const handleAddComment = () => {
    if (commentText.trim() === "") return;
    
    const newComment = {
      text: commentText,
      role: "user", // ここは将来的に Firestore からユーザー情報を取得して変更可能
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setComments([...comments, newComment]);
    setCommentText(""); // 入力欄をクリア
  };

  // 🆕 コメントを削除する（申請前のみ）
  const handleDeleteComment = (index: number) => {
    if (!isSubmitted) {
      setComments(comments.filter((_, i) => i !== index));
    }
  };

  // 🆕 申請処理（仮）
  const handleSubmit = () => {
    console.log("送信データ:", expenses);
    console.log("コメント:", comments);
    alert("申請が完了しました！");
    setIsSubmitted(true); // 申請後に編集不可にする
  };

  // 🆕 経費を一時保存する
  const handleSaveDraft = () => {
    localStorage.setItem("draft_expenses", JSON.stringify(expenses));
    alert("一時保存しました！");
  };

  return (
    <Box sx={{ maxWidth: "700px", margin: "auto", p: 3 }}>
      {/* 申請情報 */}
      <Typography variant="h5" gutterBottom>申請情報</Typography>
      <TextField label="申請日" value={today} disabled fullWidth sx={{ mb: 2 }} />
      <TextField label="プロジェクト名" value={projectName} onChange={(e) => setProjectName(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField label="開始日" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="終了日" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
      </Box>

      {/* 経費リスト */}
      <Typography variant="h6" sx={{ mt: 3 }}>経費一覧</Typography>
      <List>
        {expenses.map((expense, index) => (
          <ListItem key={index} secondaryAction={
            <>
              <IconButton edge="end" onClick={() => openModal(index)} disabled={isSubmitted}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDeleteExpense(index)} disabled={isSubmitted}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <ListItemText primary={`No.${index + 1} ${expense.vendor} ¥${expense.amount}`} secondary={expense.date} />
          </ListItem>
        ))}
      </List>

      {/* 経費追加ボタン */}
      {!isSubmitted && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openModal()} fullWidth sx={{ mt: 2 }}>
          経費を追加
        </Button>
      )}

      {/* 🆕 コメント欄 */}
      <Typography variant="h6" sx={{ mt: 3 }}>コメントと記載ください。</Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          label="コメントを入力"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <Button variant="contained" color="primary" onClick={handleAddComment} startIcon={<SendIcon />} disabled={isSubmitted}>
          送信
        </Button>
      </Box>

      {/* 🆕 コメント一覧 */}
      <List sx={{ mt: 2, maxHeight: "200px", overflowY: "auto" }}>
        {comments.map((comment, index) => (
          <ListItem key={index} secondaryAction={
            !isSubmitted && (
              <IconButton edge="end" onClick={() => handleDeleteComment(index)}>
                <DeleteIcon />
              </IconButton>
            )
          }>
            <ListItemText primary={`${comment.role === "user" ? "あなた" : "管理者"}: ${comment.text}`} secondary={comment.timestamp} />
          </ListItem>
        ))}
      </List>

      {/* 申請・一時保存ボタン */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={handleSaveDraft} disabled={isSubmitted}>一時保存</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitted}>申請</Button>
      </Box>
    </Box>
  );
};

export default History;
