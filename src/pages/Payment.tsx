import React, { useState } from "react";
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";
import ReceiptUpload from "../components/ReceiptUpload";
import Chat from "../components/Chat";

const MAX_ROWS = 30;

type PaymentEntry = {
  date: string;
  vendor: string;
  description: string;
  category: string;
  subcategory: string;
  amount: string;
  currency: string;
  receipt: File | null;
};

//精算ページのUI、動作チェック中
const Payment = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<PaymentEntry[]>([
    { date: "", vendor: "", description: "", category: "", subcategory: "", amount: "", currency: "JPY", receipt: null }
  ]);
  const [paymentType, setPaymentType] = useState("normal"); // 助成金 / 通常

  const addRow = () => {
    if (entries.length < MAX_ROWS) {
      setEntries([...entries, { date: "", vendor: "", description: "", category: "", subcategory: "", amount: "", currency: "JPY", receipt: null }]);
    }
  };

  const removeRow = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleChange = (index: number, field: keyof PaymentEntry, value: string | File | null) => {
    const newEntries = [...entries];
    newEntries[index][field] = value as never; // TypeScript の型変換
    setEntries(newEntries);
  };

  const handleSubmit = () => {
    console.log("送信データ:", entries);
    alert("申請が完了しました！");
    navigate("/dashboard/history"); // 申請完了後に履歴へ移動
  };

  return (
    <Box sx={{ p: 3, maxWidth: "800px", margin: "auto" }}>
      <Typography variant="h4">精算入力</Typography>

      {/* 助成金 / 通常 切り替え */}
      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel>支払い種別</InputLabel>
        <Select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <MenuItem value="normal">通常</MenuItem>
          <MenuItem value="grant">助成金</MenuItem>
        </Select>
      </FormControl>

      {/* 入力フォームリスト */}
      {entries.map((entry, index) => (
        <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <TextField
            label="日付"
            type="date"
            value={entry.date}
            onChange={(e) => handleChange(index, "date", e.target.value)}
          />
          <TextField label="取引先" value={entry.vendor} onChange={(e) => handleChange(index, "vendor", e.target.value)} />
          <TextField label="内容" value={entry.description} onChange={(e) => handleChange(index, "description", e.target.value)} />
          <TextField label="収支科目" value={entry.category} onChange={(e) => handleChange(index, "category", e.target.value)} />
          <TextField label="サブ収支科目" value={entry.subcategory} onChange={(e) => handleChange(index, "subcategory", e.target.value)} />
          <TextField label="支出額" type="number" value={entry.amount} onChange={(e) => handleChange(index, "amount", e.target.value)} />
          <Select value={entry.currency} onChange={(e) => handleChange(index, "currency", e.target.value)}>
            <MenuItem value="JPY">JPY</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
          </Select>

          {/* 証票アップロード */}
          <ReceiptUpload
            index={index}
            onUpload={(file) => handleChange(index, "receipt", file)}
          />

          {index > 0 && (
            <IconButton onClick={() => removeRow(index)}>
              <RemoveIcon />
            </IconButton>
          )}
        </Box>
      ))}

      {/* フォーム追加ボタン */}
      <Button onClick={addRow} disabled={entries.length >= MAX_ROWS} startIcon={<AddIcon />}>
        行を追加
      </Button>

      {/* コメント（Admin とのチャット） */}
      <Chat />

      {/* 送信・一時保存 */}
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>申請送信</Button>
        <Button variant="outlined" sx={{ ml: 2 }}>一時保存</Button>
      </Box>
    </Box>
  );
};

export default Payment;
