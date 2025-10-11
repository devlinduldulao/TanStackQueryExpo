import { Text, View, Image, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const [pulseActive, setPulseActive] = useState(true);
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  // Fix the dark overlay issue by resetting drawer state on mount
  useEffect(() => {
    // Small delay to ensure the drawer state is properly reset
    const timer = setTimeout(() => {
      navigation.closeDrawer();
    }, 100);

    return () => clearTimeout(timer);
  }, [navigation]);

  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const orbitRadius = useSharedValue(0);
  const orbitAngle = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const borderGlow = useSharedValue(0);

  // Orbit animation for the floating elements
  const orbitX = useDerivedValue(() => {
    return Math.cos(orbitAngle.value) * orbitRadius.value;
  });

  const orbitY = useDerivedValue(() => {
    return Math.sin(orbitAngle.value) * orbitRadius.value;
  });

  // Animation styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value * 360}deg` }, { scale: scale.value }],
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseValue.value }],
      opacity: 2 - pulseValue.value, // Fade out as it grows
    };
  });

  const orbitAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: orbitX.value }, { translateY: orbitY.value }],
    };
  });

  const floatingElementStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowIntensity.value,
    };
  });

  const borderGlowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: 0.3 + borderGlow.value * 0.4,
      shadowRadius: 8 + borderGlow.value * 12,
    };
  });

  // Start animations
  useEffect(() => {
    // Floating animation
    translateY.value = withRepeat(
      withSequence(withTiming(-10, { duration: 1000 }), withTiming(10, { duration: 1000 })),
      -1, // Infinite
      true // Reverse
    );

    // Rotation animation
    rotation.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1);

    // Orbit animation
    orbitRadius.value = withTiming(80, { duration: 1000 });
    orbitAngle.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1
    );

    // Glow animation
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Border glow animation
    borderGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Start pulse animation
    startPulseAnimation();

    return () => {
      setPulseActive(false);
    };
  }, []);

  // Pulse animation function
  const startPulseAnimation = () => {
    if (!pulseActive) return;

    pulseValue.value = 1;
    pulseValue.value = withDelay(
      500,
      withTiming(
        1.8,
        {
          duration: 1500,
          easing: Easing.out(Easing.ease),
        },
        (finished) => {
          if (finished) {
            scheduleOnRN(startPulseAnimation);
          }
        }
      )
    );
  };

  return (
    <>
      <LinearGradient
        colors={['#0e1e30', '#162f4b', '#044389', '#0e1e30']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: height,
          zIndex: -1,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated background circles */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: '#ff5c00',
            opacity: 0.05,
          },
          glowAnimatedStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: 200,
            backgroundColor: '#0555fa',
            opacity: 0.05,
          },
          glowAnimatedStyle,
        ]}
      />

      <SafeAreaProvider className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1"
          showsVerticalScrollIndicator={false}>
          <View className="min-h-full flex-1 items-center justify-center px-6 py-10">
            {/* Floating particles */}
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              className="absolute right-12 top-24">
              <View className="h-3 w-3 rounded-full bg-codemotion-orange opacity-60" />
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(300).springify()}
              className="absolute right-24 top-40">
              <View className="h-2 w-2 rounded-full bg-codemotion-yellow opacity-40" />
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(250).springify()}
              className="absolute left-16 top-28">
              <View className="h-2 w-2 rounded-full bg-codemotion-blue opacity-50" />
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(350).springify()}
              className="absolute bottom-40 left-8">
              <View className="h-3 w-3 rounded-full bg-codemotion-orange opacity-30" />
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              className="absolute bottom-32 right-16">
              <View className="h-2 w-2 rounded-full bg-codemotion-blue opacity-40" />
            </Animated.View>

            {/* Main glassmorphic card */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={[
                floatingElementStyle,
                borderGlowStyle,
                {
                  shadowColor: '#ff5c00',
                  shadowOffset: { width: 0, height: 8 },
                },
              ]}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-codemotion-orange/30 bg-codemotion-deepNavy/40 p-8 backdrop-blur-xl">
              {/* Gradient overlay for glassmorphism */}
              <View className="absolute inset-0 bg-gradient-to-b from-codemotion-white/5 to-transparent" />

              {/* Glow effect behind card */}
              <Animated.View
                style={glowAnimatedStyle}
                className="absolute -inset-4 rounded-3xl bg-codemotion-orange/20 blur-3xl"
              />

              <View className="relative z-10">
                {/* Logo with scale animation */}
                <View className="mb-8 items-center">
                  <Animated.View style={logoAnimatedStyle}>
                    <View className="rounded-full bg-codemotion-orange/10 p-4">
                      <Image
                        source={require('../assets/images/react-logo.png')}
                        className="h-16 w-16"
                        resizeMode="contain"
                      />
                    </View>
                  </Animated.View>
                </View>

                {/* Main title - Conference style */}
                <View className="mb-8 items-center">
                  <Text className="mb-2 text-5xl font-bold uppercase tracking-wider text-codemotion-white">
                    Codemotion
                  </Text>
                  <View className="h-1 w-24 bg-codemotion-orange" />
                  <Text className="mt-4 text-center text-sm uppercase tracking-widest text-codemotion-gray-50">
                    Milan 2025
                  </Text>
                </View>

                {/* Description */}
                <View className="mb-6">
                  <Text className="text-center text-base leading-relaxed text-codemotion-white/90">
                    TanStack Query in React Native
                  </Text>
                  <Text className="mt-1 text-center text-sm text-codemotion-blue">
                    Advanced State Management Demo
                  </Text>
                </View>

                {/* Divider with glow */}
                <View className="my-6 flex-row items-center">
                  <View className="h-px flex-1 bg-gradient-to-r from-transparent via-codemotion-orange to-transparent" />
                </View>

                {/* Speaker info - Simple and clean */}
                <View className="w-full space-y-4">
                  <Animated.View
                    entering={FadeInDown.delay(500).springify()}
                    className="flex-row items-center">
                    <Text className="ml-3 text-xl text-codemotion-orange">By: @DevlinDuldulao</Text>
                  </Animated.View>

                  <Animated.View
                    entering={FadeInDown.delay(600).springify()}
                    className="flex-row items-center">
                    <Text className="ml-3 text-lg text-codemotion-white">Crayon Consulting</Text>
                  </Animated.View>
                </View>

                {/* Year badge with pulse */}
                <View className="mt-8 items-center">
                  <Animated.View className="relative">
                    <Animated.View
                      className="absolute -inset-2 rounded-full bg-codemotion-yellow/60 blur-md"
                      style={pulseAnimatedStyle}
                    />
                    <View className="relative h-16 w-16 items-center justify-center rounded-full bg-codemotion-orange">
                      <Text className="text-xl font-bold text-codemotion-white">2025</Text>
                    </View>
                  </Animated.View>
                </View>
              </View>
            </Animated.View>

            {/* Orbiting tech icons */}
            <Animated.View style={orbitAnimatedStyle} className="absolute z-10">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-codemotion-blue shadow-lg">
                <Ionicons name="rocket" size={24} color="white" />
              </View>
            </Animated.View>

            {/* Swipe indicator - Modern style */}
            <Animated.View
              style={floatingElementStyle}
              entering={FadeInUp.delay(800).springify()}
              className="absolute bottom-8">
              <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                className="flex-row items-center space-x-2 rounded-full border border-codemotion-yellow/30 bg-codemotion-navy/60 px-6 py-3 backdrop-blur-md">
                <Ionicons name="menu" size={20} color="#f9dc5c" />
                <Text className="font-semibold text-codemotion-yellow">Explore Demos</Text>
                <Ionicons name="arrow-forward" size={20} color="#f9dc5c" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaProvider>
    </>
  );
}
