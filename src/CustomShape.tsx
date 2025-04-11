import { useCallback, useEffect } from "react";
import { HTMLContainer, Rectangle2d, ShapeUtil, T } from "tldraw";
import type { TLBaseShape, TLShape } from "tldraw";

type CustomShape = TLBaseShape<
  "custom",
  {
    w: number;
    h: number;
    expensiveData: any;
    doingSomethingExpensive: boolean;
  }
>;

export function isCustomShape(shape: TLShape): shape is CustomShape {
  return shape.type === "custom";
}

export default class CustomShapeUtil extends ShapeUtil<CustomShape> {
  static override type = "custom" as const;
  static override props = {
    w: T.number,
    h: T.number,
    expensiveData: T.any,
    doingSomethingExpensive: T.boolean,
  };

  getDefaultProps(): CustomShape["props"] {
    return {
      w: 300,
      h: 200,
      expensiveData: [],
      doingSomethingExpensive: false,
    };
  }

  override canEdit() {
    return false;
  }

  getGeometry(shape: CustomShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: CustomShape) {
    const selected = shape.id === this.editor.getOnlySelectedShapeId();

    const expensiveUpdate = useCallback(() => {
      const current = this.editor.getShape(shape.id);
      if (!current) return;

      this.editor.updateShape({
        id: current.id,
        type: current.type,
        props: {
          doingSomethingExpensive: true,
          expensiveData: [],
        },
      });

      let counter = 0;
      const interval = setInterval(() => {
        const currentShape = this.editor.getShape<CustomShape>(shape.id);
        if (!currentShape) return;
        counter++;

        this.editor.updateShape({
          id: shape.id,
          type: shape.type,
          props: {
            doingSomethingExpensive: counter === 10 ? false : true,
            expensiveData: [
              ...currentShape.props.expensiveData,
              window.crypto.randomUUID(),
            ],
          },
        });

        if (counter === 10) {
          clearInterval(interval);
        }
      }, 500);
    }, []);

    const maybeStopPropagation = useCallback(
      (e: React.PointerEvent | React.TouchEvent | React.WheelEvent) => {
        if (selected) e.stopPropagation();
      },
      [selected]
    );

    return (
      <HTMLContainer
        className="custom-shape"
        style={{
          pointerEvents: "all",
        }}
        onPointerDown={maybeStopPropagation}
        onTouchStart={maybeStopPropagation}
        onTouchEnd={maybeStopPropagation}
        onWheelCapture={maybeStopPropagation}
      >
        <p style={{ marginTop: 0 }}>custom shape</p>
        <button onClick={expensiveUpdate} type="button">
          do expensive update
        </button>
        <code>
          <pre>
            doingSomethingExpensive:{" "}
            {shape.props.doingSomethingExpensive ? "true" : "false"}
          </pre>
          <pre>expensiveData: [{shape.props.expensiveData.join(",")}]</pre>
        </code>
      </HTMLContainer>
    );
  }

  indicator(shape: CustomShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
