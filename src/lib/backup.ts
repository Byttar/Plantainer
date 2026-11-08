import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { backupFileName, parseBackup, serializeBackup, type ParsedBackup } from '@/lib/backup-format';
import type { AppData } from '@/lib/storage';

/** Lets the user pick a backup file. Resolves to null if the picker was cancelled. */
export async function pickBackup(): Promise<ParsedBackup | null> {
  // Android often reports .json files as application/octet-stream, so accept anything and validate.
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled) return null;
  return parseBackup(await new File(result.assets[0].uri).text());
}

/** Writes the backup to the cache directory and opens the system share sheet. */
export async function exportBackup(data: AppData): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }

  const file = new File(Paths.cache, backupFileName());
  if (file.exists) file.delete();
  file.write(serializeBackup(data));

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Export Plantainer data',
  });
}
