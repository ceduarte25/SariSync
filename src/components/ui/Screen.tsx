import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, space } from '@/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, scroll, padded = true, style }: Props) {
  const body = scroll ? (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[padded && styles.content, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.root, padded && styles.padded, style]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  padded: {
    padding: space.md,
  },
  content: {
    padding: space.md,
    paddingBottom: space.xl,
    gap: space.md,
  },
});
