import { useCallback, useEffect, useState } from "react";
import { ChangeSource, Editor, TLShape, TLShapeId, Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";

import CustomShapeUtil, { isCustomShape } from "./CustomShape";

import "./index.css";
import "tldraw/tldraw.css";

const id = "shape:item" as TLShapeId;

const shapeUtils = [CustomShapeUtil];

function App() {
  const store = useSyncDemo({
    roomId: "tldraw-sync-remote-changes-example-3",
    shapeUtils,
  });
  const [editor, setEditor] = useState<Editor | null>(null);

  const onBeforeShapeChanged = useCallback(
    (prev: TLShape, next: TLShape, source: ChangeSource) => {
      if (isCustomShape(prev) && isCustomShape(next)) {
        console.log("onBeforeShapeChanged", {
          source,
          prev: prev.props,
          next: next.props,
        });
        if (
          source === "remote" &&
          prev.props.doingSomethingExpensive &&
          next.props.doingSomethingExpensive !== false
        ) {
          // i'd like for this to only happen when the change was made by a remote client
          // since the current client needs to keep updating `expensiveData`
          console.log("ignoring expensiveData updates");
          return {
            ...next,
            props: {
              ...next.props,
              expensiveData: prev.props.expensiveData,
            },
          };
        }
      }
      return next;
    },
    []
  );

  const handleMount = useCallback((_editor: Editor) => {
    setEditor(_editor);

    if (!_editor.getShape(id)) {
      _editor.createShape({
        id,
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
