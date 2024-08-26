import { Color as colorInterface } from '@admiral-ds/react-ui/dist/components/themes/common/color/interfaces';

export declare type Color = colorInterface | {
  'Foundation/Blue/B50': string;
}
export declare const COLOR: Color;

export declare const themes: {
  light: {
    color: Color;
  };
  dark: {
    color: Color;
  };
};
