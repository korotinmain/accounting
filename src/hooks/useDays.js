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
import { parseDate } from "../utils/dateUtils";

/**
 * Custom hook для управління днями (CRUD операції)
 * @param {string} type - Тип ('personnel' або 'operational')
 * @returns {Object} - Стан та методи для роботи з днями
 */
export const useDays = (type) => {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Завантажує дні з Firestore
   */
  const loadDays = useCallback(
    async (silent = false) => {
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

        const daysQuery = query(
          collection(db, COLLECTIONS.DAYS),
          where("type", "==", type),
        );

        const snapshot = await getDocs(daysQuery);
        const loadedDays = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDays(loadedDays);
        setError(null);
      } catch (err) {
        console.error("Помилка завантаження днів:", err);
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
    },
    [type],
  );

  /**
   * Створює новий день
   */
  const createDay = useCallback(
    async (dayData) => {
      try {
        const docRef = await addDoc(collection(db, COLLECTIONS.DAYS), {
          ...dayData,
          type: type,
          date: Timestamp.fromDate(parseDate(dayData.dateString)),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        await loadDays(true);
        return docRef.id;
      } catch (error) {
        console.error("Помилка створення дня:", error);
        throw error;
      }
    },
    [type, loadDays],
  );

  /**
   * Оновлює існуючий день
   */
  const updateDay = useCallback(
    async (dayId, dayData) => {
      try {
        const dayRef = doc(db, COLLECTIONS.DAYS, dayId);
        await updateDoc(dayRef, {
          ...dayData,
          date: Timestamp.fromDate(parseDate(dayData.dateString)),
          updatedAt: Timestamp.now(),
        });

        await loadDays(true);
      } catch (error) {
        console.error("Помилка оновлення дня:", error);
        throw error;
      }
    },
    [loadDays],
  );

  /**
   * Видаляє день
   */
  const deleteDay = useCallback(
    async (dayId) => {
      const result = await Swal.fire({
        title: MESSAGES.CONFIRM.DELETE_TITLE,
        text: MESSAGES.CONFIRM.DELETE_TEXT,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: SWAL_CONFIG.dangerButtonColor,
        cancelButtonColor: SWAL_CONFIG.cancelButtonColor,
        confirmButtonText: "Так, видалити",
        cancelButtonText: "Скасувати",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, COLLECTIONS.DAYS, dayId));
          await loadDays(true);

          Swal.fire({
            icon: "success",
            title: MESSAGES.SUCCESS.DELETE,
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Помилка видалення дня:", error);
          Swal.fire({
            icon: "error",
            title: "Помилка",
            text: MESSAGES.ERRORS.DELETE,
            confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
          });
        }
      }
    },
    [loadDays],
  );
  // Автоматичне завантаження днів при монтуванні
  useEffect(() => {
    loadDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
  return {
    days,
    loading,
    error,
    loadDays,
    createDay,
    updateDay,
    deleteDay,
  };
};
