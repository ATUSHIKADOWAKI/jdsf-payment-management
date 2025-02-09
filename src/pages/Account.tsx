import React, { useState, useEffect } from "react";
import { TextField, Button, Grid, Paper, Typography } from "@mui/material";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// 🔥 ユーザーデータの型を定義
type UserData = {
  fullName: string;
  email: string;
  title: string;
  bank: string;
  branch: string;
  bankNum: string;
  bankHolder: string;
};

const Account = () => {
  const [formData, setFormData] = useState<UserData>({
    fullName: "",
    email: "",
    title: "",
    bank: "",
    branch: "",
    bankNum: "",
    bankHolder: "",
  });

  const [isEditing, setIsEditing] = useState(false); // 編集モードの状態

  //ユーザープロフィール情報取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setFormData(userSnap.data() as UserData);
        }
      }
    };

    fetchUserData();
  }, []);

  //入力フォームの変更監視
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //FireStoreに保存
  const handleSave = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      await updateDoc(userRef, formData);
      alert("プロフィールが更新されました！");
      setIsEditing(false); // 🔥 編集モードを解除
    } catch (error) {
      console.error("更新エラー:", error);
      alert("更新に失敗しました。");
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, margin: "auto", p: 4, mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        プロフィール設定
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="氏名"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing} // 🔥 編集モードのときのみ入力可能
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="役割"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="銀行名"
            name="bank"
            value={formData.bank}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="支店名"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="口座番号"
            name="bankNum"
            value={formData.bankNum}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="口座名義(カナ)"
            name="bankHolder"
            value={formData.bankHolder}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          {isEditing ? (
            // 🔥 「保存する」ボタン（編集モード時）
            <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
              保存する
            </Button>
          ) : (
            // 🔥 「編集する」ボタン（閲覧モード時）
            <Button variant="outlined" color="primary" onClick={() => setIsEditing(true)} fullWidth>
              編集する
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Account;