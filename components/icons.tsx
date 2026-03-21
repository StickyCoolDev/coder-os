import React from 'react';
import Svg, { Path} from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: any;
}

export const SproutIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="M7 20h10" />
    <Path d="M10 20c5.5-2.5 8-6.4 8-10 0-4.4-3.6-8-8-8s-8 3.6-8 8c0 3.6 2.5 7.5 8 10" />
    <Path d="M10 20V12" />
    <Path d="M10 12c-3.1 0-5.7-1.4-7-3.5" />
    <Path d="M10 12c3.1 0 5.7-1.4 7-3.5" />
  </Svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <Path d="m5 3 3 3" />
    <Path d="m5 21 3-3" />
    <Path d="m21 3-3 3" />
    <Path d="m21 21-3-3" />
  </Svg>
);
