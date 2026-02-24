import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, personalBlocksCol, pointsLogCol } from "../firebase/firebase";

export type BlockStatus = "pending" | "done" | "skipped";

export interface PersonalBlock {
  id: string;
  title: string;
  subject: string;
  start: string; // ISO
  end: string;   // ISO
  color: string;
  status: BlockStatus;
  createdAt: string;
}

/* -----------------------------------------------------------------
   Global Zustand store – holds user, blocks, points, streak, etc.
----------------------------------------------------------------- */
export const useTimetable = create<{
  user: any; // Firebase user (or null)
  blocks: PersonalBlock[];
  points: number;
  streak: number;
  loading: boolean;
  setUser: (u: any) => void;
  syncBlocks: () => void;
  addBlock: (
    block: Omit<PersonalBlock, "id" | "status" | "createdAt">
  ) => Promise<void>;
  updateBlockStatus: (id: string, status: BlockStatus) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
}>()(
  devtools((set, get) => ({
    user: null,
    blocks: [],
    points: 0,
    streak: 0,
    loading: false,

    setUser: (u) => {
      set({ user: u });
      if (u) get().syncBlocks();
    },

    /* -----------------------------------------------------------------
       Listen to the personalBlocks collection for the signed‑in user
    ----------------------------------------------------------------- */
    syncBlocks: () => {
      const { user } = get();
      if (!user) return;
      set({ loading: true });

      const unsub = onSnapshot(
        personalBlocksCol(user.uid),
        (snap) => {
          const blocks = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as PersonalBlock[];
          set({ blocks, loading: false });
        },
        (err) => {
          console.error(err);
          set({ loading: false });
        }
      );

      // you could store unsub somewhere if you ever need to detach
    },

    /* -----------------------------------------------------------------
       Add a new personal block
    ----------------------------------------------------------------- */
    addBlock: async (block) => {
      const { user } = get();
      if (!user) throw new Error("Not signed in");

      const docRef = await addDoc(personalBlocksCol(user.uid), {
        ...block,
        status: "pending" as BlockStatus,
        createdAt: serverTimestamp(),
      });

      // optional: add a zero‑point log entry for creation
      await addDoc(pointsLogCol(user.uid), {
        date: new Date().toISOString().split("T")[0],
        points: 0,
        reason: "Block created",
        blockId: docRef.id,
        timestamp: serverTimestamp(),
      });
    },

    /* -----------------------------------------------------------------
       Update a block’s status (done / skipped) – also updates points
    ----------------------------------------------------------------- */
    updateBlockStatus: async (id, newStatus) => {
      const { user } = get();
      if (!user) return;
      const ref = doc(personalBlocksCol(user.uid), id);
      await updateDoc(ref, { status: newStatus });

      // ---- points handling -------------------------------------------------
      let delta = 0;
      if (newStatus === "done") delta = 10;
      else if (newStatus === "skipped") delta = -5;

      if (delta !== 0) {
        await addDoc(pointsLogCol(user.uid), {
          date: new Date().toISOString().split("T")[0],
          points: delta,
          reason: `${newStatus} – ${id}`,
          blockId: id,
          timestamp: serverTimestamp(),
        });
      }

      // Re‑calculate total points & streak
      const logsSnap = await onSnapshot(pointsLogCol(user.uid), (snap) => {
        let total = 0;
        const datesWithPositive = new Set<string>();
        snap.forEach((doc) => {
          const data = doc.data() as { date: string; points: number };
          total += data.points;
          if (data.points > 0) datesWithPositive.add(data.date);
        });

        // compute streak (consecutive days ending today)
        let streak = 0;
        const today = new Date();
        const fmt = (d: Date) => d.toISOString().split("T")[0];
        let cursor = new Date(today);
        while (datesWithPositive.has(fmt(cursor))) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        }

        set({ points: total, streak });
      });
    },

    /* -----------------------------------------------------------------
       Delete a personal block
    ----------------------------------------------------------------- */
    deleteBlock: async (id) => {
      const { user } = get();
      if (!user) return;
      await deleteDoc(doc(personalBlocksCol(user.uid), id));
    },
  }))
);
