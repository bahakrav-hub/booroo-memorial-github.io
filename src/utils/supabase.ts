const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_CtWVccE6keJLSoP1KizH3A_uM0sLED-';

export interface RemoteMemory {
  id: number;
  name: string;
  message: string;
  date: string;
}

export async function getRemoteMemories(): Promise<RemoteMemory[] | null> {
  try {
    const res = await fetch(SUPABASE_URL + '?select=*&order=id.desc', {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function addRemoteMemory(
  name: string,
  message: string,
  date: string
): Promise<RemoteMemory | null> {
  try {
    const res = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ name, message, date }),
    });
    if (!res.ok) return null;
    const created = await res.json();
    return Array.isArray(created) && created.length > 0 ? created[0] : null;
  } catch {
    return null;
  }
}

export async function deleteRemoteMemory(id: number): Promise<boolean> {
  try {
    const res = await fetch(SUPABASE_URL + '?id=eq.' + id, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
