/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./contexts/AuthContext.js":
/*!*********************************!*\
  !*** ./contexts/AuthContext.js ***!
  \*********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var js_cookie__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! js-cookie */ \"js-cookie\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([js_cookie__WEBPACK_IMPORTED_MODULE_3__]);\njs_cookie__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n// contexts/AuthContext.js\n\n\n\n\n// Create the auth context\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nconst AuthProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [initialized, setInitialized] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const hasFetchedSession = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(false);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    // Check if user is authenticated on page load\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"AuthProvider.useEffect\": ()=>{\n            if (hasFetchedSession.current) return;\n            hasFetchedSession.current = true;\n            async function loadUserFromSession() {\n                try {\n                    // Try to get the session token from cookies\n                    const sessionToken = js_cookie__WEBPACK_IMPORTED_MODULE_3__[\"default\"].get('session_token');\n                    if (!sessionToken) {\n                        setLoading(false);\n                        setInitialized(true);\n                        return;\n                    }\n                    const response = await fetch('/api/auth/session');\n                    if (response.ok) {\n                        const data = await response.json();\n                        if (data.isAuthenticated && data.user) {\n                            setUser(data.user);\n                        }\n                    }\n                } catch (err) {\n                    console.error('Failed to load user session', err);\n                } finally{\n                    setLoading(false);\n                    setInitialized(true);\n                }\n            }\n            loadUserFromSession();\n        }\n    }[\"AuthProvider.useEffect\"], []); // Only run once on mount\n    // Login function\n    const login = async (email, password)=>{\n        setLoading(true);\n        setError(null);\n        try {\n            const response = await fetch('/api/auth/login', {\n                method: 'POST',\n                headers: {\n                    'Content-Type': 'application/json'\n                },\n                body: JSON.stringify({\n                    email,\n                    password\n                })\n            });\n            const data = await response.json();\n            if (!response.ok) {\n                setError(data.error || 'Login failed');\n                return {\n                    success: false,\n                    error: data.error || 'Login failed'\n                };\n            }\n            // Set user data\n            setUser(data.user);\n            // Store session token in a cookie (HttpOnly cookie should be set by the server)\n            // This is just a backup in case the server didn't set it properly\n            if (data.sessionToken) {\n                js_cookie__WEBPACK_IMPORTED_MODULE_3__[\"default\"].set('session_token', data.sessionToken, {\n                    expires: 7,\n                    path: '/',\n                    sameSite: 'strict'\n                });\n            }\n            return {\n                success: true\n            };\n        } catch (err) {\n            console.error('Login error:', err);\n            setError('An unexpected error occurred');\n            return {\n                success: false,\n                error: 'An unexpected error occurred'\n            };\n        } finally{\n            setLoading(false);\n        }\n    };\n    // Logout function\n    const logout = async ()=>{\n        setLoading(true);\n        try {\n            // Call the logout API endpoint\n            await fetch('/api/auth/logout', {\n                method: 'POST'\n            });\n            // Clear user data and session token cookie\n            setUser(null);\n            js_cookie__WEBPACK_IMPORTED_MODULE_3__[\"default\"].remove('session_token');\n            // Redirect to login page\n            router.push('/login');\n        } catch (err) {\n            console.error('Logout error:', err);\n        } finally{\n            setLoading(false);\n        }\n    };\n    // Register function (unchanged)\n    const register = async (accountData, userData)=>{\n        setLoading(true);\n        setError(null);\n        try {\n            const response = await fetch('/api/auth/register', {\n                method: 'POST',\n                headers: {\n                    'Content-Type': 'application/json'\n                },\n                body: JSON.stringify({\n                    accountName: accountData.accountName,\n                    accountDomain: accountData.accountDomain,\n                    firstName: userData.firstName,\n                    lastName: userData.lastName,\n                    email: userData.email,\n                    password: userData.password\n                })\n            });\n            const data = await response.json();\n            if (!response.ok) {\n                setError(data.error || 'Registration failed');\n                return {\n                    success: false,\n                    error: data.error || 'Registration failed'\n                };\n            }\n            return {\n                success: true,\n                accountId: data.accountId\n            };\n        } catch (err) {\n            console.error('Registration error:', err);\n            setError('An unexpected error occurred');\n            return {\n                success: false,\n                error: 'An unexpected error occurred'\n            };\n        } finally{\n            setLoading(false);\n        }\n    };\n    // Handle user permissions (unchanged)\n    const hasPermission = (permission)=>{\n        if (!user || !user.permissions) return false;\n        // Check if user has admin access\n        if (user.permissions.all === true || user.isAdmin) {\n            return true;\n        }\n        // Check for specific permission\n        return user.permissions[permission] === true;\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            isAuthenticated: !!user,\n            user,\n            loading,\n            error,\n            initialized,\n            login,\n            logout,\n            register,\n            hasPermission\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\vinod\\\\projects\\\\innvest\\\\POC\\\\innvestai\\\\contexts\\\\AuthContext.js\",\n        lineNumber: 166,\n        columnNumber: 5\n    }, undefined);\n};\nconst useAuth = ()=>(0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbnRleHRzL0F1dGhDb250ZXh0LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBCQUEwQjs7QUFDNEQ7QUFDOUM7QUFDUjtBQUVoQywwQkFBMEI7QUFDMUIsTUFBTVEsNEJBQWNQLG9EQUFhQTtBQUUxQixNQUFNUSxlQUFlLENBQUMsRUFBRUMsUUFBUSxFQUFFO0lBQ3ZDLE1BQU0sQ0FBQ0MsTUFBTUMsUUFBUSxHQUFHViwrQ0FBUUEsQ0FBQztJQUNqQyxNQUFNLENBQUNXLFNBQVNDLFdBQVcsR0FBR1osK0NBQVFBLENBQUM7SUFDdkMsTUFBTSxDQUFDYSxPQUFPQyxTQUFTLEdBQUdkLCtDQUFRQSxDQUFDO0lBQ25DLE1BQU0sQ0FBQ2UsYUFBYUMsZUFBZSxHQUFHaEIsK0NBQVFBLENBQUM7SUFDL0MsTUFBTWlCLG9CQUFvQmQsNkNBQU1BLENBQUM7SUFDakMsTUFBTWUsU0FBU2Qsc0RBQVNBO0lBRXhCLDhDQUE4QztJQUM5Q0YsZ0RBQVNBO2tDQUFDO1lBQ1IsSUFBSWUsa0JBQWtCRSxPQUFPLEVBQUU7WUFDL0JGLGtCQUFrQkUsT0FBTyxHQUFHO1lBRTVCLGVBQWVDO2dCQUNiLElBQUk7b0JBQ0YsNENBQTRDO29CQUM1QyxNQUFNQyxlQUFlaEIscURBQVcsQ0FBQztvQkFFakMsSUFBSSxDQUFDZ0IsY0FBYzt3QkFDakJULFdBQVc7d0JBQ1hJLGVBQWU7d0JBQ2Y7b0JBQ0Y7b0JBRUEsTUFBTU8sV0FBVyxNQUFNQyxNQUFNO29CQUM3QixJQUFJRCxTQUFTRSxFQUFFLEVBQUU7d0JBQ2YsTUFBTUMsT0FBTyxNQUFNSCxTQUFTSSxJQUFJO3dCQUNoQyxJQUFJRCxLQUFLRSxlQUFlLElBQUlGLEtBQUtqQixJQUFJLEVBQUU7NEJBQ3JDQyxRQUFRZ0IsS0FBS2pCLElBQUk7d0JBQ25CO29CQUNGO2dCQUNGLEVBQUUsT0FBT29CLEtBQUs7b0JBQ1pDLFFBQVFqQixLQUFLLENBQUMsK0JBQStCZ0I7Z0JBQy9DLFNB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QyxNQUFNMkMsZ0JBQWdCLENBQUNDO1FBQ3JCLElBQUksQ0FBQy9DLFFBQVEsQ0FBQ0EsS0FBS2dELFdBQVcsRUFBRSxPQUFPO1FBRXZDLGlDQUFpQztRQUNqQyxJQUFJaEQsS0FBS2dELFdBQVcsQ0FBQ0MsR0FBRyxLQUFLLFFBQVFqRCxLQUFLa0QsT0FBTyxFQUFFO1lBQ2pELE9BQU87UUFDVDtRQUVBLGdDQUFnQztRQUNoQyxPQUFPbEQsS0FBS2dELFdBQVcsQ0FBQ0QsV0FBVyxLQUFLO0lBQzFDO0lBRUEscUJBQ0UsOERBQUNsRCxZQUFZc0QsUUFBUTtRQUNuQkMsT0FBTztZQUNMakMsaUJBQWlCLENBQUMsQ0FBQ25CO1lBQ25CQTtZQUNBRTtZQUNBRTtZQUNBRTtZQUNBZ0I7WUFDQWE7WUFDQUc7WUFDQVE7UUFDRjtrQkFFQy9DOzs7Ozs7QUFHUCxFQUFFO0FBRUssTUFBTXNELFVBQVUsSUFBTTdELGlEQUFVQSxDQUFDSyxhQUFhIiwic291cmNlcyI6WyJDOlxcdmlub2RcXHByb2plY3RzXFxpbm52ZXN0XFxQT0NcXGlubnZlc3RhaVxcY29udGV4dHNcXEF1dGhDb250ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGNvbnRleHRzL0F1dGhDb250ZXh0LmpzXHJcbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0LCB1c2VTdGF0ZSwgdXNlQ29udGV4dCwgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcclxuaW1wb3J0IENvb2tpZXMgZnJvbSAnanMtY29va2llJztcclxuXHJcbi8vIENyZWF0ZSB0aGUgYXV0aCBjb250ZXh0XHJcbmNvbnN0IEF1dGhDb250ZXh0ID0gY3JlYXRlQ29udGV4dCgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1dGhQcm92aWRlciA9ICh7IGNoaWxkcmVuIH0pID0+IHtcclxuICBjb25zdCBbdXNlciwgc2V0VXNlcl0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtpbml0aWFsaXplZCwgc2V0SW5pdGlhbGl6ZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IGhhc0ZldGNoZWRTZXNzaW9uID0gdXNlUmVmKGZhbHNlKTtcclxuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkIG9uIHBhZ2UgbG9hZFxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoaGFzRmV0Y2hlZFNlc3Npb24uY3VycmVudCkgcmV0dXJuO1xyXG4gICAgaGFzRmV0Y2hlZFNlc3Npb24uY3VycmVudCA9IHRydWU7XHJcblxyXG4gICAgYXN5bmMgZnVuY3Rpb24gbG9hZFVzZXJGcm9tU2Vzc2lvbigpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBUcnkgdG8gZ2V0IHRoZSBzZXNzaW9uIHRva2VuIGZyb20gY29va2llc1xyXG4gICAgICAgIGNvbnN0IHNlc3Npb25Ub2tlbiA9IENvb2tpZXMuZ2V0KCdzZXNzaW9uX3Rva2VuJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCFzZXNzaW9uVG9rZW4pIHtcclxuICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICAgICAgc2V0SW5pdGlhbGl6ZWQodHJ1ZSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9hcGkvYXV0aC9zZXNzaW9uJyk7XHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgaWYgKGRhdGEuaXNBdXRoZW50aWNhdGVkICYmIGRhdGEudXNlcikge1xyXG4gICAgICAgICAgICBzZXRVc2VyKGRhdGEudXNlcik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCB1c2VyIHNlc3Npb24nLCBlcnIpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICAgIHNldEluaXRpYWxpemVkKHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZFVzZXJGcm9tU2Vzc2lvbigpO1xyXG4gIH0sIFtdKTsgLy8gT25seSBydW4gb25jZSBvbiBtb3VudFxyXG5cclxuICAvLyBMb2dpbiBmdW5jdGlvblxyXG4gIGNvbnN0IGxvZ2luID0gYXN5bmMgKGVtYWlsLCBwYXNzd29yZCkgPT4ge1xyXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgIHNldEVycm9yKG51bGwpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9hcGkvYXV0aC9sb2dpbicsIHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVtYWlsLCBwYXNzd29yZCB9KSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHNldEVycm9yKGRhdGEuZXJyb3IgfHwgJ0xvZ2luIGZhaWxlZCcpO1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZGF0YS5lcnJvciB8fCAnTG9naW4gZmFpbGVkJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTZXQgdXNlciBkYXRhXHJcbiAgICAgIHNldFVzZXIoZGF0YS51c2VyKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFN0b3JlIHNlc3Npb24gdG9rZW4gaW4gYSBjb29raWUgKEh0dHBPbmx5IGNvb2tpZSBzaG91bGQgYmUgc2V0IGJ5IHRoZSBzZXJ2ZXIpXHJcbiAgICAgIC8vIFRoaXMgaXMganVzdCBhIGJhY2t1cCBpbiBjYXNlIHRoZSBzZXJ2ZXIgZGlkbid0IHNldCBpdCBwcm9wZXJseVxyXG4gICAgICBpZiAoZGF0YS5zZXNzaW9uVG9rZW4pIHtcclxuICAgICAgICBDb29raWVzLnNldCgnc2Vzc2lvbl90b2tlbicsIGRhdGEuc2Vzc2lvblRva2VuLCB7IFxyXG4gICAgICAgICAgZXhwaXJlczogNywgLy8gNyBkYXlzXHJcbiAgICAgICAgICBwYXRoOiAnLycsXHJcbiAgICAgICAgICBzYW1lU2l0ZTogJ3N0cmljdCdcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0xvZ2luIGVycm9yOicsIGVycik7XHJcbiAgICAgIHNldEVycm9yKCdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQnIH07XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBMb2dvdXQgZnVuY3Rpb25cclxuICBjb25zdCBsb2dvdXQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRMb2FkaW5nKHRydWUpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIENhbGwgdGhlIGxvZ291dCBBUEkgZW5kcG9pbnRcclxuICAgICAgYXdhaXQgZmV0Y2goJy9hcGkvYXV0aC9sb2dvdXQnLCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ2xlYXIgdXNlciBkYXRhIGFuZCBzZXNzaW9uIHRva2VuIGNvb2tpZVxyXG4gICAgICBzZXRVc2VyKG51bGwpO1xyXG4gICAgICBDb29raWVzLnJlbW92ZSgnc2Vzc2lvbl90b2tlbicpO1xyXG4gICAgICBcclxuICAgICAgLy8gUmVkaXJlY3QgdG8gbG9naW4gcGFnZVxyXG4gICAgICByb3V0ZXIucHVzaCgnL2xvZ2luJyk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignTG9nb3V0IGVycm9yOicsIGVycik7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBSZWdpc3RlciBmdW5jdGlvbiAodW5jaGFuZ2VkKVxyXG4gIGNvbnN0IHJlZ2lzdGVyID0gYXN5bmMgKGFjY291bnREYXRhLCB1c2VyRGF0YSkgPT4ge1xyXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgIHNldEVycm9yKG51bGwpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9hcGkvYXV0aC9yZWdpc3RlcicsIHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICBhY2NvdW50TmFtZTogYWNjb3VudERhdGEuYWNjb3VudE5hbWUsXHJcbiAgICAgICAgICBhY2NvdW50RG9tYWluOiBhY2NvdW50RGF0YS5hY2NvdW50RG9tYWluLFxyXG4gICAgICAgICAgZmlyc3ROYW1lOiB1c2VyRGF0YS5maXJzdE5hbWUsXHJcbiAgICAgICAgICBsYXN0TmFtZTogdXNlckRhdGEubGFzdE5hbWUsXHJcbiAgICAgICAgICBlbWFpbDogdXNlckRhdGEuZW1haWwsXHJcbiAgICAgICAgICBwYXNzd29yZDogdXNlckRhdGEucGFzc3dvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuXHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICBzZXRFcnJvcihkYXRhLmVycm9yIHx8ICdSZWdpc3RyYXRpb24gZmFpbGVkJyk7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBkYXRhLmVycm9yIHx8ICdSZWdpc3RyYXRpb24gZmFpbGVkJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBhY2NvdW50SWQ6IGRhdGEuYWNjb3VudElkIH07XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignUmVnaXN0cmF0aW9uIGVycm9yOicsIGVycik7XHJcbiAgICAgIHNldEVycm9yKCdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQnIH07XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBIYW5kbGUgdXNlciBwZXJtaXNzaW9ucyAodW5jaGFuZ2VkKVxyXG4gIGNvbnN0IGhhc1Blcm1pc3Npb24gPSAocGVybWlzc2lvbikgPT4ge1xyXG4gICAgaWYgKCF1c2VyIHx8ICF1c2VyLnBlcm1pc3Npb25zKSByZXR1cm4gZmFsc2U7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGlmIHVzZXIgaGFzIGFkbWluIGFjY2Vzc1xyXG4gICAgaWYgKHVzZXIucGVybWlzc2lvbnMuYWxsID09PSB0cnVlIHx8IHVzZXIuaXNBZG1pbikge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gQ2hlY2sgZm9yIHNwZWNpZmljIHBlcm1pc3Npb25cclxuICAgIHJldHVybiB1c2VyLnBlcm1pc3Npb25zW3Blcm1pc3Npb25dID09PSB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8QXV0aENvbnRleHQuUHJvdmlkZXJcclxuICAgICAgdmFsdWU9e3tcclxuICAgICAgICBpc0F1dGhlbnRpY2F0ZWQ6ICEhdXNlcixcclxuICAgICAgICB1c2VyLFxyXG4gICAgICAgIGxvYWRpbmcsXHJcbiAgICAgICAgZXJyb3IsXHJcbiAgICAgICAgaW5pdGlhbGl6ZWQsXHJcbiAgICAgICAgbG9naW4sXHJcbiAgICAgICAgbG9nb3V0LFxyXG4gICAgICAgIHJlZ2lzdGVyLFxyXG4gICAgICAgIGhhc1Blcm1pc3Npb25cclxuICAgICAgfX1cclxuICAgID5cclxuICAgICAge2NoaWxkcmVufVxyXG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHVzZUF1dGggPSAoKSA9PiB1c2VDb250ZXh0KEF1dGhDb250ZXh0KTsiXSwibmFtZXMiOlsiUmVhY3QiLCJjcmVhdGVDb250ZXh0IiwidXNlU3RhdGUiLCJ1c2VDb250ZXh0IiwidXNlRWZmZWN0IiwidXNlUmVmIiwidXNlUm91dGVyIiwiQ29va2llcyIsIkF1dGhDb250ZXh0IiwiQXV0aFByb3ZpZGVyIiwiY2hpbGRyZW4iLCJ1c2VyIiwic2V0VXNlciIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZXJyb3IiLCJzZXRFcnJvciIsImluaXRpYWxpemVkIiwic2V0SW5pdGlhbGl6ZWQiLCJoYXNGZXRjaGVkU2Vzc2lvbiIsInJvdXRlciIsImN1cnJlbnQiLCJsb2FkVXNlckZyb21TZXNzaW9uIiwic2Vzc2lvblRva2VuIiwiZ2V0IiwicmVzcG9uc2UiLCJmZXRjaCIsIm9rIiwiZGF0YSIsImpzb24iLCJpc0F1dGhlbnRpY2F0ZWQiLCJlcnIiLCJjb25zb2xlIiwibG9naW4iLCJlbWFpbCIsInBhc3N3b3JkIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5Iiwic3VjY2VzcyIsInNldCIsImV4cGlyZXMiLCJwYXRoIiwic2FtZVNpdGUiLCJsb2dvdXQiLCJyZW1vdmUiLCJwdXNoIiwicmVnaXN0ZXIiLCJhY2NvdW50RGF0YSIsInVzZXJEYXRhIiwiYWNjb3VudE5hbWUiLCJhY2NvdW50RG9tYWluIiwiZmlyc3ROYW1lIiwibGFzdE5hbWUiLCJhY2NvdW50SWQiLCJoYXNQZXJtaXNzaW9uIiwicGVybWlzc2lvbiIsInBlcm1pc3Npb25zIiwiYWxsIiwiaXNBZG1pbiIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VBdXRoIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./contexts/AuthContext.js\n");

/***/ }),

/***/ "(pages-dir-node)/./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/AuthContext */ \"(pages-dir-node)/./contexts/AuthContext.js\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__]);\n_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n// pages/_app.js\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__.AuthProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\vinod\\\\projects\\\\innvest\\\\POC\\\\innvestai\\\\pages\\\\_app.js\",\n            lineNumber: 9,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\vinod\\\\projects\\\\innvest\\\\POC\\\\innvestai\\\\pages\\\\_app.js\",\n        lineNumber: 8,\n        columnNumber: 5\n    }, this);\n}\n// Prevent unnecessary re-renders during development\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3BhZ2VzL19hcHAuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnQkFBZ0I7O0FBQ1U7QUFDNkI7QUFDeEI7QUFFL0IsU0FBU0UsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNyQyxxQkFDRSw4REFBQ0gsK0RBQVlBO2tCQUNYLDRFQUFDRTtZQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7O0FBRzlCO0FBRUEsb0RBQW9EO0FBQ3BELGlFQUFlRixLQUFLQSxFQUFDIiwic291cmNlcyI6WyJDOlxcdmlub2RcXHByb2plY3RzXFxpbm52ZXN0XFxQT0NcXGlubnZlc3RhaVxccGFnZXNcXF9hcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFnZXMvX2FwcC5qc1xyXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBBdXRoUHJvdmlkZXIgfSBmcm9tICcuLi9jb250ZXh0cy9BdXRoQ29udGV4dCc7XHJcbmltcG9ydCBcIi4uL3N0eWxlcy9nbG9iYWxzLmNzc1wiO1xyXG5cclxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9KSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDxBdXRoUHJvdmlkZXI+XHJcbiAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cclxuICAgIDwvQXV0aFByb3ZpZGVyPlxyXG4gICk7XHJcbn1cclxuXHJcbi8vIFByZXZlbnQgdW5uZWNlc3NhcnkgcmUtcmVuZGVycyBkdXJpbmcgZGV2ZWxvcG1lbnRcclxuZXhwb3J0IGRlZmF1bHQgTXlBcHA7Il0sIm5hbWVzIjpbIlJlYWN0IiwiQXV0aFByb3ZpZGVyIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./pages/_app.js\n");

/***/ }),

/***/ "(pages-dir-node)/./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "js-cookie":
/*!****************************!*\
  !*** external "js-cookie" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = import("js-cookie");;

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("(pages-dir-node)/./pages/_app.js")));
module.exports = __webpack_exports__;

})();