import { useMemo, useState } from 'react';
import { Alert, Text } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { isNewName } from '@/domain/parsers/lines';
import { parseWorkerLines } from '@/domain/parsers/workers';
import { useStore } from '@/store/store';
import { type } from '@/theme';

export default function AddWorkersScreen() {
  const addWorkersFromText = useStore((state) => state.addWorkersFromText);
  const workers = useStore((state) => state.workers);
  const [text, setText] = useState('');
  const preview = parseWorkerLines(text);
  const existingNames = useMemo(() => workers.map((worker) => worker.name), [workers]);
  const newNames = preview.names.filter((name) => isNewName(existingNames, name));

  const save = () => {
    const result = addWorkersFromText(text);
    if (result.added === 0) {
      Alert.alert('Nothing added', 'Enter one name per line. Existing names are skipped.');
      return;
    }
    router.back();
  };

  return (
    <Screen scroll>
      <Text style={type.muted}>One name per line. You can paste a whole crew list.</Text>
      <TextField
        multiline
        value={text}
        onChangeText={setText}
        placeholder={'Mike Tyson\nJohn Roe'}
        autoCapitalize="words"
      />
      <Text style={type.body}>{newNames.length} new name(s) ready</Text>
      <Button label="Save workers" onPress={save} disabled={newNames.length === 0} />
    </Screen>
  );
}
