import React from "react";
import { Button } from "@mui/material";

const ReceiptUpload = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onUpload(event.target.files[0]);
    }
  };

  return (
    <Button component="label">
      証票アップロード
      <input type="file" hidden onChange={handleFileChange} />
    </Button>
  );
};

export default ReceiptUpload;
