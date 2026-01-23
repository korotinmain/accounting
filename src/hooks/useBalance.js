import { useState, useCallback, useEffect } from "react";
import { db } from "../api/firebase";
import {
  doc,
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { COLLECTIONS, SWAL_CONFIG, MESSAGES } from "../utils/constants";
import { validateNumber, sanitizeNumber } from "../utils/validation";

/**
 * Custom hook для управління балансом
 * @param {string} type - Тип балансу ('personnel' або 'operational')
 * @returns {Object} - Стан та методи для роботи з балансом
 */
export const useBalance = (type) => {
  const [initialBalance, setInitialBalance] = useState(0);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");

  /**
   * Завантажує початковий баланс з Firestore
   */
  const loadBalance = useCallback(async () => {
    if (!db) {
      console.error(MESSAGES.ERRORS.FIREBASE_NOT_INITIALIZED);
      return;
    }

    try {
      // Шукаємо документ за полем type
      const q = query(
        collection(db, COLLECTIONS.SETTINGS),
        where("type", "==", type),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        setInitialBalance(data.initialBalance || 0);
      } else {
        setInitialBalance(0);
      }
    } catch (error) {
      console.error("Помилка завантаження балансу:", error);
      setInitialBalance(0);
    }
  }, [type]);

  /**
   * Зберігає початковий баланс в Firestore
   */
  const saveBalance = useCallback(async () => {
    if (!validateNumber(balanceInput)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректне значення",
        text: MESSAGES.ERRORS.INVALID_AMOUNT,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return false;
    }

    const amount = sanitizeNumber(balanceInput);

    try {
      // Шукаємо існуючий документ за полем type
      const q = query(
        collection(db, COLLECTIONS.SETTINGS),
        where("type", "==", type),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Оновлюємо існуючий документ
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(
          docRef,
          {
            initialBalance: amount,
            type: type,
            updatedAt: Timestamp.now(),
          },
          { merge: true },
        );
      } else {
        // Створюємо новий документ (якщо не знайдено)
        const newDocRef = doc(collection(db, COLLECTIONS.SETTINGS));
        await setDoc(newDocRef, {
          initialBalance: amount,
          type: type,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      setInitialBalance(amount);
      setEditingBalance(false);
      setBalanceInput("");

      Swal.fire({
        icon: "success",
        title: MESSAGES.SUCCESS.SAVE,
        showConfirmButton: false,
        timer: 1500,
      });

      return true;
    } catch (error) {
      console.error("Помилка збереження балансу:", error);
      Swal.fire({
        icon: "error",
        title: "Помилка",
        text: MESSAGES.ERRORS.SAVE,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return false;
    }
  }, [balanceInput, type]);

  /**
   * Скасовує редагування балансу
   */
  const cancelEdit = useCallback(() => {
    setEditingBalance(false);
    setBalanceInput("");
  }, []);

  /**
   * Починає редагування балансу
   */
  const startEdit = useCallback(() => {
    setEditingBalance(true);
    setBalanceInput(initialBalance.toString());
  }, [initialBalance]);

  // Автоматичне завантаження балансу при монтуванні
  useEffect(() => {
    loadBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return {
    initialBalance,
    editingBalance,
    balanceInput,
    setBalanceInput,
    loadBalance,
    saveBalance,
    cancelEdit,
    startEdit,
  };
};
