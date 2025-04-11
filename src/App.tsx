import { useCallback, useEffect, useState } from "react";
import { ChangeSource, Editor, TLShape, Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";
import { diffRecord } from "@tldraw/sync-core";

import CustomShapeUtil from "./CustomShape";

import "./index.css";
import "tldraw/tldraw.css";

const shapeUtils = [CustomShapeUtil];

function App() {
  const store = useSyncDemo({
    roomId: "tldraw-sync-remote-changes-example-2",
    shapeUtils,
  });
  const [editor, setEditor] = useState<Editor | null>(null);

  const onBeforeShapeChanged = useCallback(
    (prev: TLShape, next: TLShape, source: ChangeSource) => {
      console.log("onBeforeShapeChanged", {
        source,
        diff: diffRecord(prev, next),
      });
      return next;
    },
    []
  );

  const handleMount = useCallback((_editor: Editor) => {
    setEditor(_editor);

    if (!_editor.getShape("shape:item")) {
      _editor.createShape({
        id: "shape:item",
        type: "custom",
        x: 200,
        y: 300,
      });
    }
  }, []);

  useEffect(
    () =>
      editor?.sideEffects.registerBeforeChangeHandler(
        "shape",
        onBeforeShapeChanged
      ),
    [editor, onBeforeShapeChanged]
  );

  return (
    <div className="container">
      <Tldraw store={store} shapeUtils={shapeUtils} onMount={handleMount} />
    </div>
  );
}

export default App;
