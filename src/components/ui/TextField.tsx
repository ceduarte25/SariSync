import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, space, type } from '@/theme';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
};

export function TextField({ label, hint, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={type.muted}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, rest.multiline && styles.multiline, style]}
        {...rest}
      />
      {hint ? <Text style={type.muted}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    fontSize: 16,
    color: colors.ink,
  },
  multiline: {
    minHeight: 160,
    textAlignVertical: 'top',
    paddingTop: space.md,
  },
});
