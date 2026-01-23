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
 * Custom hook для управління налаштуваннями початкових балансів
 * @returns {Object} - Стан та методи для роботи з налаштуваннями
 */
export const useSettings = () => {
  const [personnelInitialBalance, setPersonnelInitialBalance] = useState(0);
  const [operationalInitialBalance, setOperationalInitialBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * Завантажує початкові баланси з Firestore
   */
  const loadSettings = useCallback(async () => {
    if (!db) {
      console.error(MESSAGES.ERRORS.FIREBASE_NOT_INITIALIZED);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Завантажуємо баланс персонала
      const personnelQuery = query(
        collection(db, COLLECTIONS.SETTINGS),
        where("type", "==", "personnel"),
      );
      const personnelSnapshot = await getDocs(personnelQuery);
      if (!personnelSnapshot.empty) {
        const data = personnelSnapshot.docs[0].data();
        setPersonnelInitialBalance(data.initialBalance || 0);
      }

      // Завантажуємо операційний баланс
      const operationalQuery = query(
        collection(db, COLLECTIONS.SETTINGS),
        where("type", "==", "operational"),
      );
      const operationalSnapshot = await getDocs(operationalQuery);
      if (!operationalSnapshot.empty) {
        const data = operationalSnapshot.docs[0].data();
        setOperationalInitialBalance(data.initialBalance || 0);
      }
    } catch (error) {
      console.error("Помилка завантаження налаштувань:", error);
      Swal.fire({
        icon: "error",
        title: "Помилка",
        text: "Не вдалося завантажити налаштування",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Зберігає початкові баланси в Firestore
   */
  const saveSettings = useCallback(async (personnelValue, operationalValue) => {
    if (!validateNumber(personnelValue)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректне значення",
        text: "Введіть коректне значення для балансу Персонал",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return false;
    }

    if (!validateNumber(operationalValue)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректне значення",
        text: "Введіть коректне значення для балансу Операційна",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return false;
    }

    const personnelAmount = sanitizeNumber(personnelValue);
    const operationalAmount = sanitizeNumber(operationalValue);

    try {
      setSaving(true);

      // Зберігаємо баланс персонала
      const personnelQuery = query(
        collection(db, COLLECTIONS.SETTINGS),
        where("type", "==", "personnel"),
      );
      const personnelSnapshot = await getDocs(personnelQuery);

      if (!personnelSnapshot.empty) {
        const docRef = personnelSnapshot.docs[0].ref;
        await setDoc(
          docRef,
          {
            initialBalance: personnelAmount,
            type: "personnel",
            updatedAt: Timestamp.now(),
          },
          { merge: true },
        );
      } else {
        const newDocRef = doc(collection(db, COLLECTIONS.SETTINGS));
        await setDoc(newDocRef, {
          initialBalance: personnelAmount,
          type: "personnel",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Зберігаємо операційний баланс
      const operationalQuery = query(
        collection(db, COLLECTIONS.SETTINGS),
        where("type", "==", "operational"),
      );
      const operationalSnapshot = await getDocs(operationalQuery);

      if (!operationalSnapshot.empty) {
        const docRef = operationalSnapshot.docs[0].ref;
        await setDoc(
          docRef,
          {
            initialBalance: operationalAmount,
            type: "operational",
            updatedAt: Timestamp.now(),
          },
          { merge: true },
        );
      } else {
        const newDocRef = doc(collection(db, COLLECTIONS.SETTINGS));
        await setDoc(newDocRef, {
          initialBalance: operationalAmount,
          type: "operational",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      setPersonnelInitialBalance(personnelAmount);
      setOperationalInitialBalance(operationalAmount);

      Swal.fire({
        icon: "success",
        title: "Збережено",
        text: "Налаштування успішно збережено",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (error) {
      console.error("Помилка збереження налаштувань:", error);
      Swal.fire({
        icon: "error",
        title: "Помилка",
        text: "Не вдалося зберегти налаштування",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // Завантажуємо налаштування при монтуванні
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    personnelInitialBalance,
    operationalInitialBalance,
    loading,
    saving,
    loadSettings,
    saveSettings,
  };
};
