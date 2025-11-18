package com.edwin_antonio.proyectosoliv1.repository

import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.AdminUser
import com.edwin_antonio.proyectosoliv1.model.Author
import com.edwin_antonio.proyectosoliv1.model.AuthorRequest
import com.edwin_antonio.proyectosoliv1.model.Book
import com.edwin_antonio.proyectosoliv1.model.BookRequest
import com.edwin_antonio.proyectosoliv1.model.BookResponse
import com.edwin_antonio.proyectosoliv1.model.Country
import com.edwin_antonio.proyectosoliv1.model.CountryRequest
import com.edwin_antonio.proyectosoliv1.model.Editorial
import com.edwin_antonio.proyectosoliv1.model.EditorialRequest
import com.edwin_antonio.proyectosoliv1.model.Genre
import com.edwin_antonio.proyectosoliv1.model.GenreRequest
import com.edwin_antonio.proyectosoliv1.model.TextType
import com.edwin_antonio.proyectosoliv1.model.TextTypeRequest
import com.edwin_antonio.proyectosoliv1.network.ApiService
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient

class AdminRepository(private val tokenManager: TokenManager) {

    private val apiService: ApiService by lazy {
        RetrofitClient.getInstance(tokenManager)
    }

    // ==== TEXT TYPE ==== //

    suspend fun createTextType(type: String): Result<TextType> {
        return try {
            val response = apiService.createTextType(TextTypeRequest(type))
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al crear el tipo de texto: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAllTextTypes(): Result<List<TextType>> {
        return try {
            val response = apiService.getAllTextTypes()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener los tipos de texto: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTextTypeById(id: Int): Result<TextType> {
        return try {
            val response = apiService.getTextTypeById(id)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener el tipo de texto: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateTextType(id: Int, type: String): Result<TextType> {
        return try {
            val response = apiService.updateTextType(id, TextTypeRequest(type))
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al actualizar el tipo de texto: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteTextType(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteTextType(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error al eliminar el tipo de texto: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==== GENRE ==== //

    suspend fun createGenre(name: String): Result<Genre> {
        return try {
            val response = apiService.createGenre(GenreRequest(name))
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al crear el género: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAllGenres(): Result<List<Genre>> {
        return try {
            val response = apiService.getAllGenres()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener los géneros: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getGenreById(id: Int): Result<Genre> {
        return try {
            val response = apiService.getGenreById(id)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener el género: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateGenre(id: Int, name: String): Result<Genre> {
        return try {
            val response = apiService.updateGenre(id, GenreRequest(name))
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al actualizar el género: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteGenre(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteGenre(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error al eliminar el género: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==== EDITORIAL ==== //

    suspend fun createEditorial(companyName: String, countryId: Int): Result<Editorial> {
        return try {
            val response = apiService.createEditorial(EditorialRequest(companyName, countryId))
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al crear la editorial: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAllEditorials(): Result<List<Editorial>> {
        return try {
            val response = apiService.getAllEditorials()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener las editoriales: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getEditorialById(id: Int): Result<Editorial> {
        return try {
            val response = apiService.getEditorialById(id)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener la editorial: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateEditorial(id: Int, companyName: String, countryId: Int): Result<Editorial> {
        return try {
            val response = apiService.updateEditorial(id, EditorialRequest(companyName, countryId))
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al actualizar la editorial: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteEditorial(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteEditorial(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error al eliminar la editorial: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==== COUNTRY ==== //

    suspend fun createCountry(name: String): Result<Country> {
        return try {
            val response = apiService.createCountry(CountryRequest(name))
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al crear el país: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAllCountries(): Result<List<Country>> {
        return try {
            val response = apiService.getAllCountries()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener los países: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCountryById(id: Int): Result<Country> {
        return try {
            val response = apiService.getCountryById(id)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener el país: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateCountry(id: Int, name: String): Result<Country> {
        return try {
            val response = apiService.updateCountry(id, CountryRequest(name))
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al actualizar el país: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteCountry(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteCountry(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error al eliminar el país: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==== AUTHOR ==== //

    suspend fun createAuthor(request: AuthorRequest): Result<Author> {
        return try {
            val response = apiService.createAuthor(request)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al crear el autor: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAllAuthors(): Result<List<Author>> {
        return try {
            val response = apiService.getAllAuthors()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener los autores: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAuthorById(id: Int): Result<Author> {
        return try {
            val response = apiService.getAuthorById(id)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener el autor: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateAuthor(id: Int, request: AuthorRequest): Result<Author> {
        return try {
            val response = apiService.updateAuthor(id, request)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al actualizar el autor: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteAuthor(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteAuthor(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error al eliminar el autor: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==== BOOK ==== //

    suspend fun getAllBooks(): Result<BookResponse> {
        return try {
            val response = apiService.getAllBooks()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener los libros: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createBook(request: BookRequest): Result<Book> {
        return try {
            val response = apiService.createBook(request)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al crear el libro: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createBooksBatch(request: List<BookRequest>): Result<List<Book>> {
        return try {
            val response = apiService.createBooksBatch(request)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al crear los libros: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateBook(id: Int, request: BookRequest): Result<Book> {
        return try {
            val response = apiService.updateBook(id, request)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al actualizar el libro: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteBook(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteBook(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error al eliminar el libro: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==== USER ==== //

    suspend fun getAllUsers(): Result<List<AdminUser>> {
        return try {
            val response = apiService.getAllUsers()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener los usuarios: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUserById(id: Int): Result<AdminUser> {
        return try {
            val response = apiService.getUserById(id)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) } ?: Result.failure(Exception("La respuesta del servidor fue nula"))
            } else {
                Result.failure(Exception("Error al obtener el usuario: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteUser(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteUser(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error al eliminar el usuario: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
