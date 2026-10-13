import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { fileStamp } from '@/domain/dates';
import type { StoreSnapshot } from '@/domain/types';

export async function exportSnapshot(snapshot: StoreSnapshot): Promise<void> {
  const json = JSON.stringify(snapshot, null, 2);
  const file = new File(Paths.cache, `site-store-${fileStamp()}.json`);
  file.create({ overwrite: true });
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export site store data',
    UTI: 'public.json',
  });
}

export async function importSnapshotText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets[0]) return null;
  return new File(result.assets[0].uri).text();
}
