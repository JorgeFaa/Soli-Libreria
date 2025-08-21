import React, { useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Aquí luego conectas tu API 👇
    if (email && password) {
      navigation.replace("Home"); // 🔥 Reemplaza para que no regrese al login con "back"
    } else {
      alert("Por favor ingresa tus credenciales");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo y título */}
      <View style={styles.header}>
        <Image source={require("../assets/Logo.png")}
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

      <Text style={styles.divider}>o</Text>

      <TouchableOpacity style={styles.googleButton}>
        <AntDesign name="google" size={20} color="black" />
        <Text style={styles.socialText}>Continuar con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.appleButton}>
        <AntDesign name="apple1" size={20} color="white" />
        <Text style={[styles.socialText, { color: "white" }]}>
          Continuar con Apple
        </Text>
      </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.register}>Regístrate aquí</Text>
        </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6EFD7", alignItems: "center", justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 40, fontWeight: "bold", color: "#3C2A1E" },
  subtitle: { fontSize: 18, color: "#3C2A1E" },
  loginTitle: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  input: { width: "100%", backgroundColor: "#FFD966", padding: 12, borderRadius: 20, marginBottom: 15 },
  passwordContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFD966", borderRadius: 20, paddingHorizontal: 12, width: "100%", marginBottom: 5 },
  passwordInput: { flex: 1, padding: 12 },
  forgotPassword: { alignSelf: "flex-end", color: "#444", marginBottom: 20 },
  loginButton: { backgroundColor: "#FFD966", padding: 15, borderRadius: 50, width: "100%", alignItems: "center", marginBottom: 20 },
  loginButtonText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  divider: { marginVertical: 10, fontSize: 16, fontWeight: "600" },
  googleButton: { flexDirection: "row", alignItems: "center", borderColor: "#000", borderWidth: 1, borderRadius: 10, padding: 12, width: "100%", justifyContent: "center", marginBottom: 10 },
  appleButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#000", borderRadius: 10, padding: 12, width: "100%", justifyContent: "center", marginBottom: 20 },
  socialText: { marginLeft: 8, fontSize: 16 },
  register: { color: "#000", marginTop: 10 },
});