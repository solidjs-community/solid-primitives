import { ElementType, ExtendedProps, PropsOf } from "./element";

type AsProp<C extends ElementType> = {
  /**
   * Tag or component that should be used as root element.
   */
  as?: C;
};

type InheritedProps<C extends ElementType, Props = {}> = ExtendedProps<PropsOf<C>, Props>;

export type PolymorphicComponentProps<C, Props = {}> = C extends ElementType
  ? InheritedProps<C, Props & AsProp<C>>
  : Props & AsProp<ElementType>;
