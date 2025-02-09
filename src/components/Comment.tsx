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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// **Props の型を定義**
type CommentProps = {
  settlementId: string;
  isSubmitted: boolean;
};

type CommentData = {
  id: string;
  createdBy: string;
  userName: string;
  text: string;
  role: string;
  timestamp: Timestamp;
  settlementId: string;
};

const Comment: React.FC<CommentProps> = ({ settlementId, isSubmitted }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentData[]>([]);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!settlementId) return;

    console.log("🛠 Fetching comments for:", settlementId);

    const q = query(
      collection(db, "comments"),
      where("settlementId", "==", settlementId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CommentData[];

      console.log("📥 Comments fetched:", fetchedComments);
      setComments(fetchedComments);
    });

    // クリーンアップ
    return () => unsubscribe();
  }, [settlementId]);

  // コメント追加
  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;

    console.log("🛠 Adding comment for:", settlementId);

    const newComment: Omit<CommentData, "id"> = {
      createdBy: user.uid,
      userName: user.displayName || "名無し",
      text: commentText,
      role: user.email || "ユーザー",
      timestamp: Timestamp.now(),
      settlementId,
    };

    try {
      await addDoc(collection(db, "comments"), newComment);
      console.log("✅ Comment added successfully:", newComment);
      setCommentText("");
    } catch (error) {
      console.error("❌ コメント追加エラー:", error);
    }
  };

  // コメント削除
  const handleDeleteComment = async (commentId: string) => {
    try {
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);
      console.log("✅ Comment deleted:", commentId);
    } catch (error) {
      console.error("❌ コメント削除エラー:", error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">コメント</Typography>
      <List>
        {comments.map((comment) => (
          <ListItem key={comment.id}>
            <ListItemText
              primary={`${comment.userName}: ${comment.text}`}
              secondary={comment.timestamp.toDate().toLocaleString()}
            />
            {!isSubmitted && (
              <IconButton
                edge="end"
                onClick={() => handleDeleteComment(comment.id)} // ✅ 修正
              >
                <DeleteIcon />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
      {!isSubmitted && (
        <>
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
          >
            送信
          </Button>
        </>
      )}
    </Box>
  );
};

export default Comment;
