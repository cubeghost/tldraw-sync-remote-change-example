import { useCallback } from "react";
import { HTMLContainer, Rectangle2d, ShapeUtil, T } from "tldraw";
import { TLBaseShape } from "tldraw";

type CustomShape = TLBaseShape<
  "custom",
  {
    w: number;
    h: number;
    doingSomethingExpensive: boolean;
  }
>;

export default class CustomShapeUtil extends ShapeUtil<CustomShape> {
  static override type = "custom" as const;
  static override props = {
    w: T.number,
    h: T.number,
    doingSomethingExpensive: T.boolean,
  };

  getDefaultProps(): CustomShape["props"] {
    return {
      w: 200,
      h: 100,
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
        },
      });

      setTimeout(() => {
        this.editor.updateShape({
          id: current.id,
          type: current.type,
          props: {
            doingSomethingExpensive: false,
          },
        });
      }, 5000);
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
        <p>custom shape</p>
        <button onClick={expensiveUpdate} type="button">
          do expensive update
        </button>
      </HTMLContainer>
    );
  }

  indicator(shape: CustomShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
