import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
// Si quieres guardar token, descomenta esto:
// import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Animación persistente con useRef
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      // 🔄 Inicia animación infinita
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateValue.stopAnimation();
    }
  }, [loading]);

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleLogin = async () => {
    if (email && password) {
      setLoading(true);
      try {
        const response = await fetch(
          "https://x6au4w6374bk3ntf7wyo3wacmm0wwlaq.lambda-url.us-east-1.on.aws/user/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: email,
              password: password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert("❌ Error: " + (data.message || "Credenciales inválidas"));
          setLoading(false);
          return;
        }

        console.log("✅ Login exitoso:", data);

        alert("Bienvenido 🎉");
        setLoading(false);

        // Si tu API devuelve un token, guárdalo:
        // await AsyncStorage.setItem("token", data.token);

        navigation.replace("Home"); // 🔄 Va al Home si login correcto
      } catch (error) {
        console.error("❌ Error en la API:", error);
        alert("Hubo un error de conexión, intenta más tarde");
        setLoading(false);
      }
    } else {
      alert("Por favor ingresa tus credenciales");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo y título */}
      <View style={styles.header}>
        <Image
          source={require("../assets/Logo.png")}
          style={{ width: 100, height: 100 }}
        />
        <Text style={styles.title}>Soli</Text>
        <Text style={styles.subtitle}>Librería Digital</Text>
      </View>

      <Text style={styles.loginTitle}>Inicio de Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#444"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>¿Olvidaste la contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>


      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.register}>Regístrate aquí</Text>
      </TouchableOpacity>

      {/* Modal con animación de carga */}
      <Modal transparent={true} visible={loading}>
        <View style={styles.modalContainer}>
          <Animated.Image
            source={require("../assets/Logo.png")}
            style={[styles.loadingLogo, { transform: [{ rotate: rotation }] }]}
          />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6EFD7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 40, fontWeight: "bold", color: "#3C2A1E" },
  subtitle: { fontSize: 18, color: "#3C2A1E" },
  loginTitle: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  input: {
    width: "100%",
    backgroundColor: "#FFD966",
    padding: 12,
    borderRadius: 20,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD966",
    borderRadius: 20,
    paddingHorizontal: 12,
    width: "100%",
    marginBottom: 5,
  },
  passwordInput: { flex: 1, padding: 12 },
  forgotPassword: { alignSelf: "flex-end", color: "#444", marginBottom: 20 },
  loginButton: {
    backgroundColor: "#FFD966",
    padding: 15,
    borderRadius: 50,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  divider: { marginVertical: 10, fontSize: 16, fontWeight: "600" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: "100%",
    justifyContent: "center",
    marginBottom: 10,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 12,
    width: "100%",
    justifyContent: "center",
    marginBottom: 20,
  },
  socialText: { marginLeft: 8, fontSize: 16 },
  register: { color: "#000", marginTop: 10 },

  // Modal de carga
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: { width: 100, height: 100, marginBottom: 20 },
  loadingText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
