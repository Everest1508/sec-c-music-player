import { openDB } from 'idb';

const DB_NAME = 'musicDB';
const STORE_NAME = 'audioCache';

async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

export async function storeAudio(url, audioBlob) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.put(audioBlob, url);
    await tx.done;
}

export async function getAudio(url) {
    const db = await initDB();
    return db.transaction(STORE_NAME).store.get(url);
}
