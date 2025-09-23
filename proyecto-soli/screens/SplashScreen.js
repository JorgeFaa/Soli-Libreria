import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Animated, Text } from "react-native";

export default function SplashScreen() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000, // velocidad de rotación
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/Logo.png")} 
        style={[styles.logo, { transform: [{ rotate: spin }] }]}
        resizeMode="contain"
      />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD24C", 
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 20,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
