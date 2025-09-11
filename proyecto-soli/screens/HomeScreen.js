import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  TextInput,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const slideAnim = useRef(new Animated.Value(-240)).current;

  const [books] = useState([
    { id: "1", name: "Platinum End" },
    { id: "2", name: "Death Note" },
    { id: "3", name: "Naruto" },
    { id: "4", name: "Dragon Ball" },
    { id: "5", name: "One Piece" },
    { id: "6", name: "Chainsaw Man" },
  ]);

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? 0 : -240,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [menuOpen]);

  const renderBook = ({ item }) => (
    <View style={styles.bookItem}>
      <View style={styles.bookCover} />
      <Text style={styles.bookTitle}>{item.name}</Text>
    </View>
  );

  const handleLogout = () => {
    // 🔥 Animar cierre del menú
    Animated.timing(slideAnim, {
      toValue: -240,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setMenuOpen(false); // asegurar que se cierre
      navigation.replace("Login"); // 👈 redirigir al LoginScreen
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <LinearGradient
        colors={["#FFD24C", "#FF8C42"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
            <AntDesign name="menu-fold" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.logoText}>Soli Libreria</Text>
          <TouchableOpacity
            onPress={() => {
              if (searchActive) {
                setSearchActive(false);
                setSearch(""); // limpia al cerrar
              } else {
                setSearchActive(true);
              }
            }}
          >
            <AntDesign name="search1" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 🔎 Barra de búsqueda */}
      {searchActive && (
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Buscar libro..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoFocus
          />
        </View>
      )}

      {/* Lista de libros */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBook}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
      />

      {/* Drawer Overlay */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View />
        </TouchableOpacity>
      )}

      {/* Drawer con animación */}
      <Animated.View style={[styles.drawer, { left: slideAnim }]}>
        <Text style={styles.drawerTitle}>Mi cuenta</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Mi Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Mis Autores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Mis Libros</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Wishlist</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Configuración</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Soporte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Sobre Nosotros</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6EFD7" },
  statusBarSpacer: {
    height: StatusBar.currentHeight || 24,
    backgroundColor: "#FFD24C",
  },
  header: { paddingVertical: 12, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuBtn: { padding: 4 },
  logoText: { fontSize: 20, fontWeight: "bold", color: "#000" },

  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: "#fff",
  },

  listContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  bookItem: { flex: 1, margin: 8, alignItems: "center" },
  bookCover: {
    width: 80,
    height: 120,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  bookTitle: { marginTop: 6, fontSize: 12, fontWeight: "500", textAlign: "center" },

  drawerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 240,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: "#000",
  },
  drawerTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  menuItem: { paddingVertical: 12 },
  menuText: { fontSize: 16, color: "#333" },
  separator: { height: 1, backgroundColor: "#ccc", marginVertical: 8 },
});
