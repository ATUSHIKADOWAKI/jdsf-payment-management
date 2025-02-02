import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";



const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSignup = async () => {

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("サインアップ成功！");
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "user", // 管理者 or ユーザー
        createdAt: serverTimestamp(), // Firestore のタイムスタンプ
      });
      navigate("/");

    } catch (error) {
      console.error("サインアップエラー:", error);
      alert("サインアップに失敗しました。");
    }
  };

  return (
    <div>
      <h1>サインアップ</h1>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup}>サインアップ</button>
    </div>
  );
};

export default Signup;
