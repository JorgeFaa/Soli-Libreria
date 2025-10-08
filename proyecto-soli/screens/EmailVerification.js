import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
} from "react-native";

export default function EmailVerification({ route, navigation }) {
  const { username } = route.params; 
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  // 🔹 Confirmar verificación
const handleVerify = async () => {
  if (!code) {
    Alert.alert("Atención", "Por favor ingresa el código de verificación.");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(
      "https://x6au4w6374bk3ntf7wyo3wacmm0wwlaq.lambda-url.us-east-1.on.aws/user/verify-account",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code }), // 👈 ahora email ya está definido
      }
    );

    const data = await response.json();

    if (!response.ok) {
      Alert.alert("❌ Error", data.message || "Código inválido");
      setLoading(false);
      return;
    }

    Alert.alert("✅ Verificación exitosa", "Tu correo ha sido verificado.");
    navigation.replace("Login"); // redirige al login
  } catch (error) {
    console.error("Error en la API:", error);
    Alert.alert("Error", "No se pudo verificar, intenta más tarde.");
  } finally {
    setLoading(false);
  }
};

  // 🔹 Reenviar código
  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://x6au4w6374bk3ntf7wyo3wacmm0wwlaq.lambda-url.us-east-1.on.aws/user/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("❌ Error", data.message || "No se pudo reenviar el código");
        setLoading(false);
        return;
      }

      Alert.alert("📩 Código reenviado", "Revisa tu correo electrónico.");
    } catch (error) {
      console.error("Error en la API:", error);
      Alert.alert("Error", "No se pudo reenviar el código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Verificación de correo</Text>
        <Text style={styles.subtitle}>
          Ingresa el código que enviamos a tu correo:
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Código de verificación"
          placeholderTextColor="#aaa"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirmar verificación</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResend}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>Reenviar código</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6EFD7",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "85%",
    padding: 20,
    backgroundColor: "#FFD966",
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#FFEFA1",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    padding: 10,
    alignItems: "center",
  },
  secondaryText: {
    color: "#8D9CB1",
    fontSize: 15,
  },
});
