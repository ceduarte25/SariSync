import { TextField } from './TextField';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export function SearchField({ value, onChangeText, placeholder }: Props) {
  return (
    <TextField
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="while-editing"
    />
  );
}
