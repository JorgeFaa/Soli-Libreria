import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Animated,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const slideAnim = useRef(new Animated.Value(-240)).current;

  // Estados para la API
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    console.log("🚀 HomeScreen useEffect inicial ejecutándose...");
    initializeScreen();
  }, []);

  useEffect(() => {
    console.log("🏠 HomeScreen montado correctamente");
    
    return () => {
      console.log("🏠 HomeScreen desmontado");
    };
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? 0 : -240,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [menuOpen]);

  const initializeScreen = async () => {
    try {
      console.log("🏠 Inicializando HomeScreen...");
      
      const token = await AsyncStorage.getItem("authToken");
      console.log("🔍 Token encontrado:", token ? "✅ Sí" : "❌ No");
      
      if (token && token.length > 10) {
        console.log("🔑 Token válido, configurando...");
        setAuthToken(token);
        console.log("📚 Obteniendo libros...");
        await fetchBooks(token);
      } else {
        console.log("❌ Sin token válido, redirigiendo al login...");
        navigation.replace("Login");
      }
    } catch (error) {
      console.error("❌ Error al obtener el token:", error);
      navigation.replace("Login");
    }
  };

  // Función para obtener libros de la API con token
  const fetchBooks = async (token = authToken) => {
    console.log("📚 Ejecutando fetchBooks...");
    console.log("📚 Token recibido:", token ? "✅ Presente" : "❌ Ausente");
    console.log("📚 Token length:", token ? token.length : 0);
    
    if (!token) {
      console.log("❌ Sin token en fetchBooks, redirigiendo al login...");
      navigation.replace("Login");
      return;
    }

    try {
      setError(null);
      console.log("🌐 Haciendo petición a la API...");
      console.log("🔑 Authorization header:", `Bearer ${token.substring(0, 50)}...`);
      
      const response = await fetch('https://soliapi-223325065421.northamerica-south1.run.app/books', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("📡 Respuesta de la API - Status:", response.status);
      console.log("📡 Respuesta de la API - OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Error response body:", errorText);
        
        if (response.status === 401) {
          console.log("🔒 Token expirado (401), limpiando storage...");
          await AsyncStorage.removeItem("authToken");
          Alert.alert(
            "Sesión expirada",
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            [{ text: "OK", onPress: () => navigation.replace("Login") }]
          );
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("📖 Libros obtenidos:", data.length, "libros");
      console.log("📖 Primer libro:", data[0] ? data[0].title : "No hay libros");
      setBooks(data);
    } catch (err) {
      console.error('❌ Error fetching books:', err);
      console.error('❌ Error stack:', err.stack);
      setError(err.message);
      
      if (err.message.includes('401')) {
        await AsyncStorage.removeItem("authToken");
        Alert.alert(
          "Error de Autenticación",
          "Token inválido o expirado. Por favor, inicia sesión nuevamente.",
          [{ text: "OK", onPress: () => navigation.replace("Login") }]
        );
      } else {
        Alert.alert(
          "Error",
          `No se pudieron cargar los libros: ${err.message}`,
          [{ text: "OK" }]
        );
      }
    } finally {
      console.log("📚 fetchBooks finalizando, loading=false");
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para refresh
  const onRefresh = () => {
    console.log("🔄 Refresh activado");
    setRefreshing(true);
    fetchBooks();
  };

  // Función para filtrar libros por búsqueda
  const getFilteredBooks = () => {
    if (!search.trim()) return books;
    
    return books.filter(book =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.description.toLowerCase().includes(search.toLowerCase()) ||
      book.authors.some(author => 
        `${author.name} ${author.middleName || ''} ${author.lastName}`.toLowerCase().includes(search.toLowerCase())
      ) ||
      book.genres.some(genre => 
        genre.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  // Función para formatear el nombre del autor
  const formatAuthorName = (author) => {
    const middleName = author.middleName ? ` ${author.middleName}` : '';
    return `${author.name}${middleName} ${author.lastName}`;
  };

  // Render de libro adaptado a la nueva estructura de la API
  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => {
        console.log("📖 Navegando a detalles del libro:", item.title);
        navigation.navigate("Details", { book: item });
      }}
    >
      <Image 
        source={{ uri: item.coverUrl }} 
        style={styles.bookCover}
        defaultSource={require('../assets/placeholder-book.png')}
        onError={() => {
          console.log('Error loading image:', item.coverUrl);
        }}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {/* Mostrar autor principal */}
        {item.authors && item.authors.length > 0 && (
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {formatAuthorName(item.authors[0])}
            {item.authors.length > 1 && " y otros"}
          </Text>
        )}
        
        {/* Mostrar género principal */}
        {item.genres && item.genres.length > 0 && (
          <Text style={styles.bookGenre} numberOfLines={1}>
            {item.genres[0].name}
          </Text>
        )}
        
        <Text style={styles.bookDate}>
          {new Date(item.publishedDate).getFullYear()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Header del FlatList SOLO con el título - SIN TextInput
  const renderHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        Todos los libros ({getFilteredBooks().length})
      </Text>
    </View>
  );

  // Renderizado cuando está cargando
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF8C42" />
      <Text style={styles.loadingText}>Cargando libros...</Text>
    </View>
  );

  // Renderizado cuando hay error
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Error al cargar los libros</Text>
      <Text style={styles.errorDetails}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchBooks()}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizado cuando no hay libros
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No se encontraron libros</Text>
    </View>
  );

  const handleLogout = async () => {
    try {
      console.log("🚪 Iniciando logout...");
      await AsyncStorage.removeItem("authToken");
      console.log("🚪 Token eliminado, cerrando sesión...");
      
      Animated.timing(slideAnim, {
        toValue: -240,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setMenuOpen(false);
        navigation.replace("Login");
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      navigation.replace("Login");
    }
  };

  const handleNavigateToFavorites = () => {
    Animated.timing(slideAnim, {
      toValue: -240,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setMenuOpen(false);
      navigation.navigate("Favorites");
    });
  };

  console.log("🖼️ Renderizando HomeScreen - loading:", loading, "error:", !!error, "books:", books.length);

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
          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={styles.menuBtn}
          >
            <AntDesign name="menu-fold" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.logoText}>Soli Libreria</Text>
          
          <TouchableOpacity
            onPress={() => {
              if (searchActive) {
                setSearchActive(false);
                setSearch("");
              } else {
                setSearchActive(true);
              }
            }}
          >
            <AntDesign name="search1" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Barra de búsqueda FUERA del FlatList */}
      {searchActive && (
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Buscar por título, autor o género..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      )}

      {/* Contenido principal */}
      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={getFilteredBooks()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBook}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF8C42"]}
            />
          }
          columnWrapperStyle={styles.row}
          keyboardShouldPersistTaps="handled"
        />
      )}

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
        <TouchableOpacity style={styles.menuItem} onPress={handleNavigateToFavorites}>
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

  // ✅ FIJO: Barra de búsqueda fuera del FlatList
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F6EFD7",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  // Nuevos estilos para FlatList
  flatListContainer: { 
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3C2A1E",
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },

  // Estilos para grid de libros - actualizado
  bookItem: { 
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: '45%',
  },
  bookCover: {
    width: '100%',
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
    marginBottom: 8,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 4,
    textAlign: "center",
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    textAlign: "center",
    fontStyle: "italic",
  },
  bookGenre: {
    fontSize: 11,
    color: "#FF8C42",
    marginBottom: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  bookDate: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    fontWeight: "500",
  },

  // Estilos para estados de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#D94F30",
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: 'center',
  },

  // Estilos del drawer
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