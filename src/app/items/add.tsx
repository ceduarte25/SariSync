import { useMemo, useState } from 'react';
import { Alert, Text } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { formatMoney } from '@/domain/money';
import { isNewName } from '@/domain/parsers/lines';
import { parseCatalogLines } from '@/domain/parsers/catalog';
import { useStore } from '@/store/store';
import { type } from '@/theme';

export default function AddItemsScreen() {
  const addItemsFromText = useStore((state) => state.addItemsFromText);
  const items = useStore((state) => state.items);
  const [text, setText] = useState('');
  const preview = parseCatalogLines(text);
  const existingNames = useMemo(() => items.map((item) => item.name), [items]);
  const newItems = preview.items.filter((item) => isNewName(existingNames, item.name));

  const save = () => {
    const result = addItemsFromText(text);
    if (result.added === 0) {
      Alert.alert('Nothing added', 'Check the pattern and skip names already in the catalog.');
      return;
    }
    router.back();
  };

  return (
    <Screen scroll>
      <Text style={type.muted}>
        One item per line. Use "item - bought - selling" or "item - selling".
      </Text>
      <TextField
        multiline
        value={text}
        onChangeText={setText}
        autoCapitalize="none"
        placeholder={'coke - 20 - 25\npancit - 45'}
      />
      {newItems.map((item) => (
        <Text key={item.name} style={type.body}>
          {item.name} · sell {formatMoney(item.sellCents)}
          {item.costCents != null ? ` · bought ${formatMoney(item.costCents)}` : ''}
        </Text>
      ))}
      {preview.issues.map((issue) => (
        <Text key={`${issue.lineNumber}-${issue.line}`} style={type.muted}>
          Line {issue.lineNumber}: {issue.message}
        </Text>
      ))}
      <Button label="Save items" onPress={save} disabled={newItems.length === 0} />
    </Screen>
  );
}
