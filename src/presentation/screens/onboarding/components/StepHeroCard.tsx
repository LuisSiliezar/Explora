import React from 'react';
import { View } from 'react-native';
import { Icon, Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { BARS, type Step } from '../constants';

interface Props {
  step: Step;
  n: number;
  tint: { bg: string; fg: string };
}

/** Tinted overlay on the photo: step badge, hero number/icon, note and bars. */
export const StepHeroCard = ({ step, n, tint }: Props) => {
  const t = useT();
  return (
    <View className="flex-1 justify-between p-4">
      <View
        className="self-start rounded-full px-2.5 py-1"
        style={{ backgroundColor: tint.bg }}
      >
        <Text
          className="font-sans-medium text-xs tracking-widest"
          style={{ color: tint.fg }}
        >
          {t('stepOf', { n })}
        </Text>
      </View>
      <View
        className="gap-2.5 rounded-[14px] p-4"
        style={{ backgroundColor: tint.bg }}
      >
        {'text' in step.hero ? (
          <Text
            className="font-display-bold text-6xl leading-none tracking-tighter"
            style={{ color: tint.fg }}
          >
            {step.hero.text}
          </Text>
        ) : (
          <Icon
            name={step.hero.icon}
            size={52}
            strokeWidth={1.75}
            colorValue={tint.fg}
          />
        )}
        <Text
          className="font-sans-medium text-xs tracking-widest"
          style={{ color: tint.fg }}
        >
          {t(step.note)}
        </Text>
        <View className="gap-1.5">
          {BARS.map(bar => (
            <View
              key={bar.width}
              className="h-1 rounded-sm"
              style={{
                width: bar.width,
                opacity: bar.opacity,
                backgroundColor: tint.fg,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
