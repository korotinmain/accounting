import { useState, useCallback, useEffect } from "react";
import { db } from "../api/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { COLLECTIONS, SWAL_CONFIG, MESSAGES } from "../utils/constants";

/**
 * Custom hook для управління операційними записами (без днів)
 * @returns {Object} - Стан та методи для роботи з записами
 */
export const useOperationalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Завантажує записи з Firestore
   */
  const loadEntries = useCallback(async (silent = false) => {
    if (!db) {
      const errorMsg = MESSAGES.ERRORS.FIREBASE_NOT_INITIALIZED;
      console.error(errorMsg);
      setError(errorMsg);
      if (!silent) {
        Swal.fire({
          icon: "error",
          title: "Помилка",
          text: errorMsg,
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
      }
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);

      const entriesQuery = query(
        collection(db, COLLECTIONS.OPERATIONAL),
        where("type", "==", "operational"),
      );

      const snapshot = await getDocs(entriesQuery);
      const loadedEntries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEntries(loadedEntries);
      setError(null);
    } catch (err) {
      console.error("Помилка завантаження записів:", err);
      const errorMsg = `${MESSAGES.ERRORS.LOAD}: ${err.message}`;
      setError(errorMsg);
      if (!silent) {
        Swal.fire({
          icon: "error",
          title: "Помилка",
          text: errorMsg,
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Створює новий запис
   */
  const createEntry = useCallback(
    async (entryData) => {
      try {
        const docRef = await addDoc(collection(db, COLLECTIONS.OPERATIONAL), {
          name: entryData.name,
          amount: entryData.amount,
          date: entryData.date,
          isWithdrawal: entryData.isWithdrawal || false,
          type: "operational",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        await loadEntries(true);
        return docRef.id;
      } catch (error) {
        console.error("Помилка створення запису:", error);
        throw error;
      }
    },
    [loadEntries],
  );

  /**
   * Оновлює існуючий запис
   */
  const updateEntry = useCallback(
    async (entryId, entryData) => {
      try {
        const entryRef = doc(db, COLLECTIONS.OPERATIONAL, entryId);
        await updateDoc(entryRef, {
          name: entryData.name,
          amount: entryData.amount,
          date: entryData.date,
          isWithdrawal: entryData.isWithdrawal || false,
          updatedAt: Timestamp.now(),
        });

        await loadEntries(true);
      } catch (error) {
        console.error("Помилка оновлення запису:", error);
        throw error;
      }
    },
    [loadEntries],
  );

  /**
   * Видаляє запис
   */
  const deleteEntry = useCallback(
    async (entryId) => {
      const result = await Swal.fire({
        title: "Видалити запис?",
        text: "Цю дію неможливо скасувати",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: SWAL_CONFIG.dangerButtonColor,
        cancelButtonColor: SWAL_CONFIG.cancelButtonColor,
        confirmButtonText: "Так, видалити",
        cancelButtonText: "Скасувати",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, COLLECTIONS.OPERATIONAL, entryId));
          await loadEntries(true);

          Swal.fire({
            icon: "success",
            title: MESSAGES.SUCCESS.DELETE,
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Помилка видалення запису:", error);
          Swal.fire({
            icon: "error",
            title: "Помилка",
            text: MESSAGES.ERRORS.DELETE,
            confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
          });
        }
      }
    },
    [loadEntries],
  );

  // Автоматичне завантаження записів при монтуванні
  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    entries,
    loading,
    error,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };
};
