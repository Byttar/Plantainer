import * as DocumentPicker from 'expo-document-picker';

import { backupFileName, parseBackup, serializeBackup, type ParsedBackup } from '@/lib/backup-format';
import type { AppData } from '@/lib/storage';

/** Lets the user pick a backup file. Resolves to null if the picker was cancelled. */
export async function pickBackup(): Promise<ParsedBackup | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', base64: false });
  if (result.canceled) return null;
  const file = result.assets[0].file;
  if (!file) throw new Error('Could not read the selected file.');
  return parseBackup(await file.text());
}

/** Downloads the backup as a JSON file. */
export async function exportBackup(data: AppData): Promise<void> {
  const blob = new Blob([serializeBackup(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFileName();
  link.click();
  URL.revokeObjectURL(url);
}
