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
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid"; // ランダムなID生成用ライブラリ
import Comment from "../components/Comment";
import { auth } from "../firebase";
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
  expenses: any[];
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
const Payment = ({
  selectedSettlement,
}: {
  selectedSettlement: Settlement;
  isEditable: boolean;
}) => {
  const [projectName, setProjectName] = useState(
    selectedSettlement?.projectName || ""
  );
  const [startDate, setStartDate] = useState(
    selectedSettlement?.startDate || ""
  );
  const [endDate, setEndDate] = useState(selectedSettlement?.endDate || "");
  const [expenses, setExpenses] = useState<Expense[]>(
    selectedSettlement?.expenses || []
  );
  //精算一覧 表示用

  const db = getFirestore(); // Firestore のインスタンスを取得
  const { role, user } = useUserRole();

  useEffect(() => {
    if (selectedSettlement) {
      setProjectName(selectedSettlement.projectName);
      setStartDate(selectedSettlement.startDate);
      setEndDate(selectedSettlement.endDate);
      setExpenses(selectedSettlement.expenses);
    }
  }, [selectedSettlement, role, user]);

  const [settlementId, setSettlementId] = useState(
    selectedSettlement?.id || uuidv4()
  );

  // 申請後の編集制限
  const [isSubmitted, setIsSubmitted] = useState(false);

  //精算入力フォーム用
  const [currentExpense, setCurrentExpense] = useState<Expense>({
    date: "",
    vendor: "",
    description: "",
    category: "",
    subcategory: "",
    amount: "",
    currency: "",
    receipt: null,
    fileName: null,
  });

  const today = new Date().toISOString().split("T")[0];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const handleUploadStart = () => setLoading(true);
  const handleUploadEnd = () => setLoading(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleAddNewExpense = () => {
    setIsModalOpen(true);
    setCurrentExpense((prev) => ({
      ...prev,
      receipt: null,
    }));
    setFileName(null);
    setEditingIndex(null);
  };

  // 経費を追加・更新する
  const handleSaveExpense = async () => {
    if (
      !currentExpense.date ||
      !currentExpense.vendor ||
      !currentExpense.amount
    ) {
      alert("日付、取引先、金額を入力してください。");
      return;
    }

    //編集モード
    if (editingIndex !== null) {
      const updatedExpenses = [...expenses];
      updatedExpenses[editingIndex] = {
        ...currentExpense,
      };
      setExpenses(updatedExpenses);
      setEditingIndex(null);
    } else {
      setExpenses((prev) => [...prev, { ...currentExpense }]);
    }
  };

  //経費を編集
  const modifyExpense = (index: number) => {
    setIsModalOpen(true);
    const expense = expenses[index];

    setCurrentExpense({ ...expense });

    if (expense.fileName) {
      setFileName(expense.fileName);
    } else {
      setFileName(null);
    }
    setEditingIndex(index);
  };

  // 経費を削除する
  const handleDeleteExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleReciptUpload = (url: string, name: string) => {
    setCurrentExpense((prev) => ({ ...prev, receipt: url, fileName: name }));
    if (name) {
      setFileName(name);
    }
  };

  const hancleClearReceipt = () => {
    setCurrentExpense((prev) => ({ ...prev, receipt: "" }));
    setFileName(null);
  };

  // 🆕 申請処理（仮）
  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("ログインしてください");
      return;
    }
    if (!projectName || !startDate || !endDate || expenses.length === 0) {
      alert("必要な情報をすべて入力してください。");
      return;
    }

    const db = getFirestore();

    // 🔥 ユーザーの role を取得
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("ユーザー情報が見つかりません");
      return;
    }

    const userData = userSnap.data();

    const settlementData = {
      id: settlementId,
      applicantId: user.uid,
      applicantName: user.displayName || "未設定",
      projectName,
      startDate,
      endDate,
      submittedAt: Timestamp.now(),
      expenses,
      status: "申請中",
      role: userData.role, // 🔥 ユーザーの role を保存
    };

    try {
      const docRef = await addDoc(
        collection(db, "settlements"),
        settlementData
      );
      alert("精算申請を送信しました");
      console.log("✅ Firestore に保存成功: ", docRef.id);
    } catch (error) {
      console.error("❌ Firestore 保存エラー:", error);
      alert("Firestore に保存できませんでした。");
    }

    setIsSubmitted(true); // 申請後に編集不可にする
  };

  //承認
  const handleApprove = async () => {
    if (!selectedSettlement) {
      alert("承認対象の.精算データが見つかりません。");
      return;
    }

    try {
      console.log("Firestore パス:", `settlements/${selectedSettlement.id}`);
      const settlementRef = doc(db, "settlements", selectedSettlement.id);
      await updateDoc(settlementRef, { status: "承認" });
      alert("精算を承認しました。");
      setIsSubmitted(true); // 申請後に編集不可にする
    } catch (error) {
      console.error("❌ Firestore 更新エラー:", error);
      alert("Firestore に更新できませんでした。");
    }
  };

  // 経費を一時保存する
  const handleSaveDraft = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("ログインしてください");
      return;
    }
    if (!projectName || !startDate || !endDate) {
      alert("プロジェクト名、開始日、終了日を入力してください。");
      return;
    }

    const db = getFirestore();

    const draftData = {
      id: settlementId,
      applicantId: user.uid,
      applicantName: user.displayName || "未設定",
      projectName,
      startDate,
      endDate,
      submittedAt: Timestamp.now(),
      expenses,
      status: "編集中",
    };

    try {
      if (selectedSettlement?.id) {
        const settlementRef = doc(db, "settlements", selectedSettlement.id);
        await updateDoc(settlementRef, draftData);
        alert("一時保存しました（更新）！");
      } else {
        const docRef = await addDoc(collection(db, "settlements"), draftData);
        alert("一時保存しました（新規）！");
        console.log("✅ Firestore に一時保存成功: ", docRef.id);
      }
    } catch (error) {
      console.error("❌ Firestore 保存エラー:", error);
      alert("Firestore に保存できませんでした。");
    }
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
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={{ maxWidth: "700px", margin: "auto", p: 7 }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "700px",
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <IconButton
            onClick={() => setIsModalOpen(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
            }}
          >
            <CloseIcon />
          </IconButton>
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
                  categoryOptions[currentExpense.category].map(
                    (subcategory) => (
                      <MenuItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </MenuItem>
                    )
                  )}
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
            <Grid item xs={12}>
              {/* 証票アップロード */}
              <ReceiptUpload
                onUpload={handleReciptUpload}
                onUploadStart={handleUploadStart}
                onUploadEnd={handleUploadEnd}
                onClear={hancleClearReceipt}
              />
              <Typography variant="body2">
                {currentExpense.receipt ? (
                  <a
                    href={currentExpense.receipt}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {fileName || "ファイルを表示"}
                  </a>
                ) : (
                  "ファイル未選択"
                )}
              </Typography>
              {fileName && (
                <Button onClick={hancleClearReceipt} color="error">
                  削除
                </Button>
              )}
            </Grid>
          </Grid>
          {!isSubmitted && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleSaveExpense()}
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              経費を追加
            </Button>
          )}
        </Box>
      </Modal>
      {/* 経費追加ボタン */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddNewExpense}
        fullWidth
        sx={{ mt: 2 }}
        disabled={isSubmitted}
      >
        経費を追加
      </Button>
      {/* 経費リスト */}
      {expenses.length > 0 && (
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
                      onClick={() => modifyExpense(index)}
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
                  secondary={`${expense.date} ${expense.description}`}
                />
                {expense.receipt && (
                  <a
                    href={expense.receipt}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {expense.fileName}
                  </a>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      <Typography variant="h6" sx={{ mt: 3 }}>
        合計額:
        {expenses.reduce((total, item) => total + Number(item.amount), 0)}円
      </Typography>
      {/* 🆕 コメント欄 */}
      <Comment settlementId={settlementId} isSubmitted={isSubmitted} />

      {/* 申請・一時保存ボタン */}
      {role === "admin" ? (
        <>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              disabled={isSubmitted}
            >
              差し戻し
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApprove}
              disabled={isSubmitted}
            >
              承認
            </Button>
          </Box>
        </>
      ) : (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
        >
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
      )}
    </Box>
  );
};

export default Payment;
