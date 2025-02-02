import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const useUserRole = () => {
    const [user, setUser] = useState<{ uid: string } | null>(null);
    const [role, setRole] = useState<"admin" | "user" | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ 1️⃣ Firebase Authentication のログイン状態を監視
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userData = { uid: currentUser.uid };
                setUser(userData);
                await fetchUserRole(userData.uid); // ✅ `user` が更新される前に `role` を取得
            } else {
                setUser(null);
                setRole(null);
                setLoading(false);
            }
        });

        return () => unsubscribe(); // クリーンアップ
    }, []); // ✅ 修正: 依存配列から `user` を削除

    // ✅ 2️⃣ Firestore から `role` を取得する関数
    const fetchUserRole = async (uid: string) => {
        try {
            const userRef = doc(db, "users", uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                setRole(docSnap.data().role);
            } else {
                setRole("user"); // デフォルトは "user"
            }
        } catch (error) {
            console.error("Firestore エラー:", error);
        } finally {
            setLoading(false);
        }
    };

    return { user, role, loading };
};

export default useUserRole;
