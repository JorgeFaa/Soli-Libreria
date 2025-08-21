import React, { useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    // Aquí puedes integrar tu API para guardar datos
    if (name && lastname && gender && email && password) {
      alert("Cuenta creada con éxito 🎉");
      navigation.replace("Login"); // 🔄 Regresa al login
    } else {
      alert("Por favor completa todos los campos");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/Logo.png")} 
        style={{ width: 100, height: 100 }}
        />
        <Text style={styles.title}>Soli</Text>
        <Text style={styles.subtitle}>Librería Digital</Text>
      </View>

      <Text style={styles.registerTitle}>Registro</Text>

      <View style={styles.formBox}>
        <Text style={styles.formTitle}>Crea una cuenta</Text>

        {/* Nombre y Apellido */}
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

        {/* Género */}
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

        {/* Correo */}
        <TextInput
          style={styles.input}
          placeholder="Correo"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Botón registrarse */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <Text style={styles.divider}>o</Text>

      {/* Botones sociales */}
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

      {/* Ir a login */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLink}>¿Ya tienes una cuenta?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6EFD7", alignItems: "center", justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "bold", color: "#3C2A1E" },
  subtitle: { fontSize: 15, color: "#3C2A1E" },
  registerTitle: { fontSize: 20, fontWeight: "600", marginBottom: 15 },
  formBox: {
    width: "100%",
    backgroundColor: "#FFEFA1",
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
  },
  formTitle: { fontSize: 14, fontWeight: "600", marginBottom: 10, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { fontSize: 14, marginBottom: 5 },
  input: { backgroundColor: "#FFD966", padding: 12, borderRadius: 20, marginBottom: 10 },
  genderButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 3,
    backgroundColor: "#FFD966",
    borderRadius: 15,
    alignItems: "center",
  },
  genderSelected: { backgroundColor: "#FFCC00" },
  genderText: { fontSize: 14, color: "#000" },
  registerButton: {
    backgroundColor: "#FFD966",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: { fontSize: 14, fontWeight: "bold", color: "#000" },
  divider: { marginVertical: 2, fontSize: 20, fontWeight: "600" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: "100%",
    justifyContent: "center",
    marginBottom: 5,
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
  socialText: { marginLeft: 8, fontSize: 14 },
  loginLink: { marginTop: -10, color: "#000" },
});
