import 'react-native';

declare module 'react-native' {
  interface TextProps {
    className?: string;
  }
  interface ViewProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface TouchableHighlightProps {
    className?: string;
  }
  interface TouchableWithoutFeedbackProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface FlatListProps<T> {
    className?: string;
  }
  interface SectionListProps<T, S> {
    className?: string;
  }
}
