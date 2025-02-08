import React, { useState } from "react";
import { Button, CircularProgress, Typography, Box } from "@mui/material";
import { storage } from "../firebase"; // Firebase 設定をインポート
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

const ReceiptUpload = ({
  onUpload,
  onUploadStart,
  onUploadEnd,
  onClear,
}: {
  onUpload: (url: string, name: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  onClear: () => void;
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileName = file.name; // ✅ ファイル名を取得
    setFileName(fileName);
    setUploading(true);
    onUploadStart();

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("ログインが必要です。");
        onUploadEnd();
        return;
      }

      const storageRef = ref(storage, `receipts/${user.uid}/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setDownloadURL(url); 
      onUpload(url, fileName); 
    } catch (error) {
      console.error("アップロードエラー:", error);
      alert("アップロードに失敗しました。");
    }

    setUploading(false);
    onUploadEnd();
  };

  const handleClearFile = () => {
    setFileName(null);
    setDownloadURL(null); // ✅ URL も削除
    onUpload("", ""); // ✅ 修正: 空の値を渡してリセット
    onClear();
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Button
        component="label"
        variant="contained"
        color="primary"
        disabled={uploading}
      >
        {uploading ? <CircularProgress size={24} /> : "証憑アップロード"}
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
    </Box>
  );
};

export default ReceiptUpload;
