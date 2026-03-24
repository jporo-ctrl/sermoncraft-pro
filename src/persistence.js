persistence.jsimport {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db, ensureUser } from "./firebase";

function userRef(uid) {
  return doc(db, "users", uid);
}

function usageRef(uid) {
  return doc(db, "usage", uid);
}

export async function bootPersistence() {
  const user = await ensureUser();
  const uid = user.uid;

  const userDocRef = userRef(uid);
  const usageDocRef = usageRef(uid);

  const [userSnap, usageSnap] = await Promise.all([
    getDoc(userDocRef),
    getDoc(usageDocRef),
  ]);

  if (!userSnap.exists()) {
    await setDoc(userDocRef, {
      uid,
      plan: "free",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userDocRef, {
      updatedAt: serverTimestamp(),
    });
  }

  if (!usageSnap.exists()) {
    await setDoc(usageDocRef, {
      uid,
      fastCount: 0,
      deepCount: 0,
      totalCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return {
    uid,
    plan: userSnap.exists() ? userSnap.data().plan || "free" : "free",
    usage: usageSnap.exists()
      ? usageSnap.data()
      : {
          fastCount: 0,
          deepCount: 0,
          totalCount: 0,
        },
  };
}

export async function getUserState() {
  const user = await ensureUser();
  const uid = user.uid;

  const [userSnap, usageSnap] = await Promise.all([
    getDoc(userRef(uid)),
    getDoc(usageRef(uid)),
  ]);

  const plan = userSnap.exists() ? userSnap.data().plan || "free" : "free";

  const usage = usageSnap.exists()
    ? usageSnap.data()
    : {
        fastCount: 0,
        deepCount: 0,
        totalCount: 0,
      };

  return {
    uid,
    plan,
    usage,
  };
}

export async function recordUsage(mode) {
  if (mode !== "fast" && mode !== "deep") {
    throw new Error("mode must be 'fast' or 'deep'");
  }

  const user = await ensureUser();
  const uid = user.uid;

  const usageDocRef = usageRef(uid);
  const usageSnap = await getDoc(usageDocRef);

  if (!usageSnap.exists()) {
    await setDoc(usageDocRef, {
      uid,
      fastCount: 0,
      deepCount: 0,
      totalCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const payload = {
    totalCount: increment(1),
    updatedAt: serverTimestamp(),
  };

  if (mode === "fast") {
    payload.fastCount = increment(1);
  }

  if (mode === "deep") {
    payload.deepCount = increment(1);
  }

  await updateDoc(usageDocRef, payload);

  const updated = await getDoc(usageDocRef);
  return updated.data();
}

export async function setUserPlan(plan) {
  const user = await ensureUser();
  const uid = user.uid;

  await setDoc(
    userRef(uid),
    {
      uid,
      plan,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const updated = await getDoc(userRef(uid));
  return updated.data();
}