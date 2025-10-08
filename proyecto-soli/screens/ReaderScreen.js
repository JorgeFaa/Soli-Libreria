import React, { useState } from "react";
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  StatusBar, 
  ActivityIndicator,
  Alert 
} from "react-native";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

export default function ReaderScreen({ route, navigation }) {
  const { uri, title } = route.params;
  const [loading, setLoading] = useState(true);

  // Usar Google Docs Viewer para mostrar PDFs
  const pdfViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`;

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={26} color="#2E2E2E" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerText} numberOfLines={1}>
            {title || "Lector"}
          </Text>
        </View>
        
        <View style={{ width: 26 }} />
      </LinearGradient>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C42" />
          <Text style={styles.loadingText}>Cargando libro...</Text>
        </View>
      )}

      {/* WebView con PDF */}
      <WebView
        source={{ uri: pdfViewerUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onLoadStart={() => {
          console.log("📖 Iniciando carga del libro...");
          setLoading(true);
        }}
        onLoadEnd={() => {
          console.log("✅ Libro cargado exitosamente");
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ Error en WebView:', nativeEvent);
          setLoading(false);
          Alert.alert(
            "Error de carga",
            "No se pudo cargar el libro. Verifica tu conexión a internet.",
            [
              { text: "Reintentar", onPress: () => setLoading(true) },
              { text: "Volver", onPress: () => navigation.goBack() }
            ]
          );
        }}
        renderError={(errorDomain, errorCode, errorDesc) => (
          <View style={styles.errorContainer}>
            <AntDesign name="exclamationcircle" size={48} color="#D94F30" />
            <Text style={styles.errorText}>Error al cargar el libro</Text>
            <Text style={styles.errorDetails}>{errorDesc}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4E3",
  },
  statusBarSpacer: {
    height: StatusBar.currentHeight || 24,
    backgroundColor: "#FFD24C",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E2E2E",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 244, 227, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: "#D94F30",
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: "600",
  },
  errorDetails: {
    fontSize: 14,
    color: "#666",
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});