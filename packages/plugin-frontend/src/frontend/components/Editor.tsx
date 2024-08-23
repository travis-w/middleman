import { BeforeMount } from '@monaco-editor/react';
import { lazy, Suspense } from 'react';

interface EditorProps {
  value: string;
  onChange?: (val?: string) => void;
  disabled?: boolean;
}

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

export const Editor: React.FC<EditorProps> = (props) => {
  const { value, onChange, disabled } = props;

  const onBeforeMount: BeforeMount = () => {
    // monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    //   validate: true,
    //   schemas: []
    // })
  };
  
  return (
    <Suspense fallback={<>Editor Loading...</>}>
      <MonacoEditor
        value={value}
        height="350px"
        onChange={onChange}
        language="json"
        width={'100%'}
        theme="vs-dark"
        options={{
          scrollBeyondLastLine: false,
          minimap: {
            enabled: false
          },
          contextmenu: false,
          readOnly: disabled ?? false
        }}
        beforeMount={onBeforeMount}
      />
    </Suspense>
  );
};