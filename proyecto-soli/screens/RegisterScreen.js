import React, { useState } from "react"; 
import { 
  View, 
  Image, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 Nuevo estado

  const handleRegister = async () => {
    if (!name || !lastname || !gender || !username || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      const response = await fetch(
        "https://soliapi-223325065421.northamerica-south1.run.app/user/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "No se pudo registrar");
        return;
      }

      Alert.alert("🎉 Registro exitoso", "Se ha enviado un código a tu correo");
      navigation.navigate("EmailVerification", { username });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un error al registrar");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image source={require("../assets/Logo.png")} style={{ width: 100, height: 100 }} />
          <Text style={styles.title}>Soli</Text>
          <Text style={styles.subtitle}>Librería Digital</Text>
        </View>

        <View style={styles.formBox}>
          <Text style={styles.formTitle}>Crea una cuenta</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Apellidos"
              value={lastname}
              onChangeText={setLastname}
            />
          </View>

          <Text style={styles.label}>Género:</Text>
          <View style={styles.row}>
            {["Hombre", "Mujer", "No Binario"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderButton, gender === g && styles.genderSelected]}
                onPress={() => setGender(g)}
              >
                <Text style={styles.genderText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={username}
            onChangeText={setUsername}
          />

          {/* 👇 Campo de contraseña con icono */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Contraseña"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <AntDesign 
                name={showPassword ? "eyeo" : "eye"} 
                size={22} 
                color="#3C2A1E" 
                style={{ marginLeft: -35 }} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <Text style={styles.loginLink}>¿Ya tienes una cuenta?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#F6EFD7", alignItems: "center", justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "bold", color: "#3C2A1E" },
  subtitle: { fontSize: 15, color: "#3C2A1E" },
  formBox: { width: "100%", backgroundColor: "#FFEFA1", borderRadius: 10, padding: 15, marginBottom: 5 },
  formTitle: { fontSize: 14, fontWeight: "600", marginBottom: 10, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { fontSize: 14, marginBottom: 5 },
  input: { backgroundColor: "#FFD966", padding: 12, borderRadius: 20, marginBottom: 10 },
  genderButton: { flex: 1, padding: 10, marginHorizontal: 3, backgroundColor: "#FFD966", borderRadius: 15, alignItems: "center" },
  genderSelected: { backgroundColor: "#FFCC00" },
  genderText: { fontSize: 14, color: "#000" },
  registerButton: { backgroundColor: "#FFD966", padding: 10, borderRadius: 50, alignItems: "center", marginTop: 10 },
  registerButtonText: { fontSize: 14, fontWeight: "bold", color: "#000" },
  loginLink: { marginTop: 10, color: "#000" },
  passwordContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#FFD966", 
    borderRadius: 20, 
    paddingRight: 10, 
    marginBottom: 10 
  },
});
