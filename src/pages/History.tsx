import React, { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ReceiptUpload from "../components/ReceiptUpload";

type Expense = {
  date: string;
  vendor: string;
  description: string;
  category: string;
  subcategory: string;
  amount: string;
  currency: string;
  receipt: File | null;
};

const categoryOptions: Record<string, string[]> = {
  諸謝金: [
    "強化ｽﾀｯﾌ･ﾄﾚｰﾅｰ",
    "管理栄養士･帯同審判員・看護師",
    "ﾄﾞｸﾀｰ",
    "支援ｽﾀｯﾌ･競技ﾊﾟｰﾄﾅｰ･介助者",
    "競技用具担当スタッフ",
    "海外招聘ｺｰﾁ",
    "通訳(専門的能力を有する者）",
    "その他",
  ],
  旅費: [
    "交通費",
    "日当（旅行雑費）",
    "宿泊費",
    "隔離に必要な宿泊費",
    "その他",
  ],
  渡航費: ["交通費・雑費", "その他"],
  滞在費: ["宿泊費", "隔離に必要な宿泊費", "日当（旅行雑費）", "その他"],
  借料及び損料: [
    "会場借料・付属設備利用料",
    "事務所賃貸料",
    "通信機器借料・物品リース料",
    "バス・車借料",
    "光熱水料金",
    "ICTｼｽﾃﾑ･ﾄﾚｰﾆﾝｸﾞ機材利用料",
    "その他",
  ],
  消耗品費: ["事務用品", "参加賞", "食事代", "その他"],
  スポーツ用具費: [
    "競技用具･設営用品･AED･WBGT",
    "ﾕﾆﾌｫｰﾑ等被服類･ｾﾞｯｹﾝ･ﾋﾞﾌﾞｽ",
    "水分補給に必要な飲料",
    "ｺﾝﾃﾞｨｼｮﾆﾝｸﾞ維持に必要な物品",
    "医薬品(ｱﾝﾁ･ﾄﾞｰﾋﾟﾝｸﾞを考慮）",
    "衛生消耗品",
    "ICTｼｽﾃﾑ･ﾄﾚｰﾆﾝｸﾞ機材導入費用",
    "その他",
  ],
  備品費: ["医・科学ｻﾎﾟｰﾄ備品", "その他"],
  印刷製本費: ["ﾎﾟｽﾀｰ･ﾌﾟﾛｸﾞﾗﾑ･ﾁﾗｼ印刷", "その他"],
  通信運搬費: ["通信費･郵送費", "荷物運搬料"],
  委託費: ["委託費", "補助金", "負担金", "助成金", "その他"],
  賃金: ["ﾅｼｮﾅﾙｺｰﾁ等賃金", "専任ｺｰﾁ等賃金", "事務局員賃金", "その他"],
  会議費: ["会議の弁当・飲料", "その他"],
  雑役務費: [
    "会場設営費･看板作成費",
    "警備費",
    "管理栄養費",
    "ｱｽﾘｰﾄﾁｪｯｸ検査費用",
    "PCR検査･抗原定量検査費用",
    "陰性証明書発行費用",
    "銀行振込手数料",
    "その他",
  ],
  保険料: ["海外旅行保険料", "傷害保険料", "動産保険料", "その他"],
  その他: [
    "両替手数料",
    "印紙代",
    "参加料",
    "大会開催契約料",
    "公認料",
    "その他",
  ],
};

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
  const [comments, setComments] = useState<
    { text: string; role: string; timestamp: string }[]
  >([]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      date: "",
      vendor: "",
      description: "",
      category: "",
      subcategory: "",
      amount: "",
      currency: "JPY",
      receipt: null,
    },
  ]);

  const [currentExpense, setCurrentExpense] = useState<Expense>({
    date: "",
    vendor: "",
    description: "",
    category: "",
    subcategory: "",
    amount: "",
    currency: "",
    receipt: null,
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 経費を追加・更新する
  const handleSaveExpense = () => {
   setExpenses([...expenses,currentExpense]);
    // if (editingIndex !== null) {
    //   const updatedExpenses = [...currentExpense];
    //   updatedExpenses[editingIndex] = currentExpense;
    //   setExpenses(updatedExpenses);
    // } else {
    //   setExpenses([...expenses, currentExpense]);
    // }
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

  const removeRow = (index: number) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(newExpenses);
  };

  // 🆕 申請処理（仮）
  const handleSubmit = () => {
    alert("申請が完了しました！");
    setIsSubmitted(true); // 申請後に編集不可にする
  };

  // 🆕 経費を一時保存する
  const handleSaveDraft = () => {
    localStorage.setItem("draft_expenses", JSON.stringify(expenses));
    alert("一時保存しました！");
  };

  const handleChange = (field: keyof Expense, value: string | File | null) => {
    setCurrentExpense((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "category" ? { subcategory: "" } : {}),
    })); // 収支科目が変更されたらサブ収支科目をリセット
  };

  return (
    <Box sx={{ maxWidth: "700px", margin: "auto", p: 3 }}>
      {/* 申請情報 */}
      <Typography variant="h5" gutterBottom>
        申請情報
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <TextField
            label="申請日"
            value={today}
            disabled
            fullWidth
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={9}>
          <TextField
            label="プロジェクト名"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="事業開始日"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="事業終了日"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      <Box sx={{ maxWidth: "700px", margin: "auto", p: 7 }}>
        <Typography variant="h5" gutterBottom>
          経費入力
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              size="small"
              label="取引日"
              type="date"
              value={currentExpense.date}
              onChange={(e) => handleChange("date", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              size="small"
              label="取引先"
              value={currentExpense.vendor}
              onChange={(e) => handleChange("vendor", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              size="small"
              label="内容"
              value={currentExpense.description}
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <Select
              size="small"
              value={currentExpense.category}
              onChange={(e) => handleChange("category", e.target.value)}
              displayEmpty
              fullWidth
            >
              {/* 収支科目のセレクトボックス */}

              <MenuItem value="" disabled>
                収支科目を選択
              </MenuItem>
              {Object.keys(categoryOptions).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          {/* サブ収支科目のセレクトボックス */}
          <Grid item xs={6}>
            <Select
              size="small"
              value={currentExpense.subcategory}
              onChange={(e) => handleChange("subcategory", e.target.value)}
              displayEmpty
              disabled={!currentExpense.category}
              fullWidth
            >
              <MenuItem value="" disabled>
                サブ収支科目を選択
              </MenuItem>
              {currentExpense.category &&
                categoryOptions[currentExpense.category].map((subcategory) => (
                  <MenuItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </MenuItem>
                ))}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small"
              label="支出額"
              type="number"
              value={currentExpense.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              size="small"
              value={currentExpense.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              fullWidth
            >
              <MenuItem value="JPY">JPY</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
          </Grid>
          {/* 証票アップロード */}
          <ReceiptUpload onUpload={(file) => handleChange("receipt", file)} />

          {/* {index > 0 && (
            <IconButton onClick={() => removeRow(index)}>
              <RemoveIcon />
            </IconButton>
          )}
           */}
        </Grid>
        {!isSubmitted && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleSaveExpense()}
            fullWidth
            sx={{ mt: 2 }}
          >
            経費を追加
          </Button>
        )}
      </Box>

      {/* 経費追加ボタン */}

      {/* 経費リスト */}
      {expenses.length > 1 && (
        <Box>
          <Typography variant="h6" sx={{ mt: 3 }}>
            経費一覧
          </Typography>
          <List>
            {expenses.map((expense, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      onClick={() => openModal(index)}
                      disabled={isSubmitted}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteExpense(index)}
                      disabled={isSubmitted}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`No.${index + 1} ${expense.vendor} ¥${
                    expense.amount
                  }`}
                  secondary={expense.date}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* 🆕 コメント欄 */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        コメント(任意)
      </Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          label="コメントを入力"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddComment}
          startIcon={<SendIcon />}
          disabled={isSubmitted}
        >
          送信
        </Button>
      </Box>

      {/* 🆕 コメント一覧 */}
      <List sx={{ mt: 2, maxHeight: "200px", overflowY: "auto" }}>
        {comments.map((comment, index) => (
          <ListItem
            key={index}
            secondaryAction={
              !isSubmitted && (
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteComment(index)}
                >
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
            <ListItemText
              primary={`${comment.role === "user" ? "あなた" : "管理者"}: ${
                comment.text
              }`}
              secondary={comment.timestamp}
            />
          </ListItem>
        ))}
      </List>

      {/* 申請・一時保存ボタン */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleSaveDraft}
          disabled={isSubmitted}
        >
          一時保存
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitted}
        >
          申請
        </Button>
      </Box>
    </Box>
  );
};

export default History;
