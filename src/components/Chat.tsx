import React from "react";
import { Box, TextField, Button } from "@mui/material";

const Chat = () => {
  return (
    <Box sx={{ mt: 3, p: 2, border: "1px solid gray", borderRadius: 2 }}>
      <TextField fullWidth multiline rows={3} placeholder="Admin にコメントを送る" />
      <Button variant="contained" sx={{ mt: 1 }}>送信</Button>
    </Box>
  );
};

export default Chat;
