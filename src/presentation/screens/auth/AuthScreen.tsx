import React, { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DomainErrorCode } from '@domain/errors';
import { isDomainError } from '@domain/errors';
import {
  Banner,
  Button,
  IconButton,
  Text,
  TextField,
  type TextFieldRef,
} from '@presentation/components';
import {
  useAccount,
  useDependencies,
  useIsOnline,
  useToast,
} from '@presentation/hooks';
import { useT, type StringKey } from '@presentation/i18n';
import type { RootStackScreenProps } from '@presentation/routes/types';
import { LanguagePill } from '../onboarding/OnboardingScreen';

const ERRORS: Partial<Record<DomainErrorCode, StringKey>> = {
  INVALID_EMAIL: 'errEmail',
  WEAK_PASSWORD: 'errPass',
  OFFLINE: 'errOffline',
};

/** Optional sign in (local-only for now). Guests get the full app. */
export const AuthScreen = ({
  navigation,
  route,
}: RootStackScreenProps<'Auth'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const online = useIsOnline();
  const { settingsStore, haptics } = useDependencies();
  const { signIn } = useAccount();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<DomainErrorCode | null>(null);
  const passwordRef = useRef<TextFieldRef>(null);
  const signup = mode === 'signup';
  const fromOnboarding = route.params.from === 'onboarding';

  const finish = () => {
    if (fromOnboarding) {
      settingsStore.getState().completeOnboarding(); // the navigator swaps to the app
    } else {
      navigation.goBack();
    }
  };

  const submit = () => {
    try {
      signIn({ email, password, name: signup ? name : undefined });
      haptics.success();
      toast.show(t(signup ? 'toastAccountCreated' : 'toastSignedIn'));
      finish();
    } catch (e) {
      haptics.warning();
      setError(isDomainError(e) ? e.code : 'UNKNOWN');
    }
  };

  const errorText = error ? t(ERRORS[error] ?? 'toastSomethingWrong') : null;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 pt-[18px]">
        <IconButton
          icon="back"
          onPress={() => navigation.goBack()}
          accessibilityLabel={t('back')}
        />
        <LanguagePill />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerClassName="gap-[22px] px-5 pt-[26px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View className="gap-[9px]">
          <Text
            accessibilityRole="header"
            className="font-sans-bold text-[30px] leading-[34px] tracking-[-0.7px]"
          >
            {t(signup ? 'signUpTitle' : 'signInTitle')}
          </Text>
          <Text className="text-[15px] leading-[22px] text-text-muted">
            {t(signup ? 'signUpSub' : 'signInSub')}
          </Text>
        </View>

        <View className="gap-3">
          {signup && (
            <TextField
              label={t('name')}
              value={name}
              onChangeText={setName}
              placeholder={t('namePh')}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />
          )}
          <TextField
            label={t('email')}
            value={email}
            onChangeText={value => {
              setEmail(value);
              setError(null);
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            invalid={error === 'INVALID_EMAIL'}
          />
          <TextField
            ref={passwordRef}
            label={t('password')}
            value={password}
            onChangeText={value => {
              setPassword(value);
              setError(null);
            }}
            placeholder="••••••••"
            secureTextEntry
            autoComplete={signup ? 'new-password' : 'current-password'}
            textContentType={signup ? 'newPassword' : 'password'}
            returnKeyType="go"
            onSubmitEditing={submit}
            invalid={error === 'WEAK_PASSWORD'}
          />
          {errorText && <Banner tone="danger" title={errorText} />}
          {!online && <Banner tone="notice" title={t('authOffline')} />}
        </View>

        <View className="gap-[11px]">
          <Button
            label={t(signup ? 'createAccount' : 'signIn')}
            onPress={submit}
          />
          <Button
            label={t(signup ? 'toSignIn' : 'toSignUp')}
            variant="secondary"
            onPress={() => {
              setMode(signup ? 'signin' : 'signup');
              setError(null);
            }}
          />
          <Button label={t('guest')} variant="link" onPress={finish} />
        </View>
        <Text className="text-[12px] leading-[18px] text-text-muted">
          {t('authLegal')}
        </Text>
      </ScrollView>
    </View>
  );
};
