import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

export default function DetailsScreen({ route, navigation }) {
  const { book } = route.params;

  return (
    <View style={styles.container}>
      {/* Espaciador de la barra de notificaciones */}
      <View style={styles.statusBarSpacer} />

      {/* Header con botón volver */}
      <LinearGradient
        colors={["#FFD24C", "#FF8C42"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={26} color="#2E2E2E" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerText} numberOfLines={1}>
            Detalles
          </Text>
        </View>

        {/* Espacio para balancear */}
        <View style={{ width: 26 }} />
      </LinearGradient>

      {/* Contenido scrollable */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Portada */}
          <Image source={{ uri: book.cover }} style={styles.cover} />

          {/* Info */}
          <Text style={styles.title}>{book.name}</Text>
          <Text style={styles.author}>Autor: {book.author}</Text>
          <Text style={styles.genre}>Género: {book.genre}</Text>

          {/* Sinopsis */}
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.synopsis}>{book.synopsis}</Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.readBtn]}>
            <AntDesign name="book" size={18} color="#2E2E2E" />
            <Text style={styles.buttonText}>Leer Ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.favoriteBtn]}>
            <AntDesign name="staro" size={18} color="#fff" />
            <Text style={[styles.buttonText, { color: "#fff" }]}>Agregar a Favoritos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4E3", // 🎨 Arena Suave
  },
  statusBarSpacer: {
    height: StatusBar.currentHeight || 24,
    backgroundColor: "#FFD24C", // mismo color que header
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  cover: {
    width: 200,
    height: 280,
    resizeMode: "cover",
    borderRadius: 12,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E2E2E",
    textAlign: "center",
    marginBottom: 6,
  },
  author: {
    fontSize: 16,
    color: "#FF8C42", // 🎨 Naranja Atardecer
    marginBottom: 4,
  },
  genre: {
    fontSize: 15,
    color: "#D94F30", // 🎨 Rojo Terracota
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  synopsis: {
    fontSize: 15,
    color: "#2E2E2E",
    textAlign: "justify",
    lineHeight: 22,
  },
  actions: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  readBtn: {
    backgroundColor: "#FFD24C", // 🎨 Amarillo Solar
  },
  favoriteBtn: {
    backgroundColor: "#FF8C42", // 🎨 Naranja Atardecer
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#2E2E2E",
  },
});
