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

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _src_index_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../src/index.css */ \"./src/index.css\");\n/* harmony import */ var _src_index_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_src_index_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _src_App_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../src/App.css */ \"./src/App.css\");\n/* harmony import */ var _src_App_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_src_App_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _src_components_Navbar_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../src/components/Navbar.css */ \"./src/components/Navbar.css\");\n/* harmony import */ var _src_components_Navbar_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_src_components_Navbar_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _src_pages_Auth_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../src/pages/Auth.css */ \"./src/pages/Auth.css\");\n/* harmony import */ var _src_pages_Auth_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_src_pages_Auth_css__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _src_pages_Dashboard_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../src/pages/Dashboard.css */ \"./src/pages/Dashboard.css\");\n/* harmony import */ var _src_pages_Dashboard_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_src_pages_Dashboard_css__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _src_pages_Expenses_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../src/pages/Expenses.css */ \"./src/pages/Expenses.css\");\n/* harmony import */ var _src_pages_Expenses_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_src_pages_Expenses_css__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _src_pages_Groups_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../src/pages/Groups.css */ \"./src/pages/Groups.css\");\n/* harmony import */ var _src_pages_Groups_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_src_pages_Groups_css__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _src_pages_Portfolio_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../src/pages/Portfolio.css */ \"./src/pages/Portfolio.css\");\n/* harmony import */ var _src_pages_Portfolio_css__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_src_pages_Portfolio_css__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _src_pages_Insights_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../src/pages/Insights.css */ \"./src/pages/Insights.css\");\n/* harmony import */ var _src_pages_Insights_css__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_src_pages_Insights_css__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_10__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! next/router */ \"../node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var _src_context_AuthContext__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../src/context/AuthContext */ \"./src/context/AuthContext.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_src_context_AuthContext__WEBPACK_IMPORTED_MODULE_12__]);\n_src_context_AuthContext__WEBPACK_IMPORTED_MODULE_12__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\n\n\n\n\n\n\n\nfunction RouteGate({ Component, pageProps }) {\n    const { user, loading } = (0,_src_context_AuthContext__WEBPACK_IMPORTED_MODULE_12__.useAuth)();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_11__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_10__.useEffect)(()=>{\n        if (loading) return;\n        if (Component.requireAuth && !user) {\n            router.replace(\"/login\");\n            return;\n        }\n        if (Component.guestOnly && user) {\n            router.replace(\"/\");\n        }\n    }, [\n        Component.guestOnly,\n        Component.requireAuth,\n        loading,\n        router,\n        user\n    ]);\n    if (loading) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"loading\",\n            children: \"Loading...\"\n        }, void 0, false, {\n            fileName: \"/Users/sudeshhnabehera/FinLens/frontend/pages/_app.js\",\n            lineNumber: 33,\n            columnNumber: 12\n        }, this);\n    }\n    if (Component.requireAuth && !user) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"loading\",\n            children: \"Redirecting to login...\"\n        }, void 0, false, {\n            fileName: \"/Users/sudeshhnabehera/FinLens/frontend/pages/_app.js\",\n            lineNumber: 37,\n            columnNumber: 12\n        }, this);\n    }\n    if (Component.guestOnly && user) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"loading\",\n            children: \"Redirecting...\"\n        }, void 0, false, {\n            fileName: \"/Users/sudeshhnabehera/FinLens/frontend/pages/_app.js\",\n            lineNumber: 41,\n            columnNumber: 12\n        }, this);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n        ...pageProps\n    }, void 0, false, {\n        fileName: \"/Users/sudeshhnabehera/FinLens/frontend/pages/_app.js\",\n        lineNumber: 44,\n        columnNumber: 10\n    }, this);\n}\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_src_context_AuthContext__WEBPACK_IMPORTED_MODULE_12__.AuthProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(RouteGate, {\n            Component: Component,\n            pageProps: pageProps\n        }, void 0, false, {\n            fileName: \"/Users/sudeshhnabehera/FinLens/frontend/pages/_app.js\",\n            lineNumber: 50,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/sudeshhnabehera/FinLens/frontend/pages/_app.js\",\n        lineNumber: 49,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUEwQjtBQUNGO0FBQ2M7QUFDUDtBQUNLO0FBQ0Q7QUFDRjtBQUNHO0FBQ0Q7QUFFRDtBQUNNO0FBQzJCO0FBRW5FLFNBQVNJLFVBQVUsRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQUU7SUFDekMsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRSxHQUFHTCxrRUFBT0E7SUFDakMsTUFBTU0sU0FBU1IsdURBQVNBO0lBRXhCRCxpREFBU0EsQ0FBQztRQUNSLElBQUlRLFNBQVM7UUFFYixJQUFJSCxVQUFVSyxXQUFXLElBQUksQ0FBQ0gsTUFBTTtZQUNsQ0UsT0FBT0UsT0FBTyxDQUFDO1lBQ2Y7UUFDRjtRQUVBLElBQUlOLFVBQVVPLFNBQVMsSUFBSUwsTUFBTTtZQUMvQkUsT0FBT0UsT0FBTyxDQUFDO1FBQ2pCO0lBQ0YsR0FBRztRQUFDTixVQUFVTyxTQUFTO1FBQUVQLFVBQVVLLFdBQVc7UUFBRUY7UUFBU0M7UUFBUUY7S0FBSztJQUV0RSxJQUFJQyxTQUFTO1FBQ1gscUJBQU8sOERBQUNLO1lBQUlDLFdBQVU7c0JBQVU7Ozs7OztJQUNsQztJQUVBLElBQUlULFVBQVVLLFdBQVcsSUFBSSxDQUFDSCxNQUFNO1FBQ2xDLHFCQUFPLDhEQUFDTTtZQUFJQyxXQUFVO3NCQUFVOzs7Ozs7SUFDbEM7SUFFQSxJQUFJVCxVQUFVTyxTQUFTLElBQUlMLE1BQU07UUFDL0IscUJBQU8sOERBQUNNO1lBQUlDLFdBQVU7c0JBQVU7Ozs7OztJQUNsQztJQUVBLHFCQUFPLDhEQUFDVDtRQUFXLEdBQUdDLFNBQVM7Ozs7OztBQUNqQztBQUVlLFNBQVNTLElBQUksRUFBRVYsU0FBUyxFQUFFQyxTQUFTLEVBQUU7SUFDbEQscUJBQ0UsOERBQUNKLG1FQUFZQTtrQkFDWCw0RUFBQ0U7WUFBVUMsV0FBV0E7WUFBV0MsV0FBV0E7Ozs7Ozs7Ozs7O0FBR2xEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmlubGVucy1mcm9udGVuZC8uL3BhZ2VzL19hcHAuanM/ZTBhZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4uL3NyYy9pbmRleC5jc3MnO1xuaW1wb3J0ICcuLi9zcmMvQXBwLmNzcyc7XG5pbXBvcnQgJy4uL3NyYy9jb21wb25lbnRzL05hdmJhci5jc3MnO1xuaW1wb3J0ICcuLi9zcmMvcGFnZXMvQXV0aC5jc3MnO1xuaW1wb3J0ICcuLi9zcmMvcGFnZXMvRGFzaGJvYXJkLmNzcyc7XG5pbXBvcnQgJy4uL3NyYy9wYWdlcy9FeHBlbnNlcy5jc3MnO1xuaW1wb3J0ICcuLi9zcmMvcGFnZXMvR3JvdXBzLmNzcyc7XG5pbXBvcnQgJy4uL3NyYy9wYWdlcy9Qb3J0Zm9saW8uY3NzJztcbmltcG9ydCAnLi4vc3JjL3BhZ2VzL0luc2lnaHRzLmNzcyc7XG5cbmltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcbmltcG9ydCB7IEF1dGhQcm92aWRlciwgdXNlQXV0aCB9IGZyb20gJy4uL3NyYy9jb250ZXh0L0F1dGhDb250ZXh0JztcblxuZnVuY3Rpb24gUm91dGVHYXRlKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xuICBjb25zdCB7IHVzZXIsIGxvYWRpbmcgfSA9IHVzZUF1dGgoKTtcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobG9hZGluZykgcmV0dXJuO1xuXG4gICAgaWYgKENvbXBvbmVudC5yZXF1aXJlQXV0aCAmJiAhdXNlcikge1xuICAgICAgcm91dGVyLnJlcGxhY2UoJy9sb2dpbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChDb21wb25lbnQuZ3Vlc3RPbmx5ICYmIHVzZXIpIHtcbiAgICAgIHJvdXRlci5yZXBsYWNlKCcvJyk7XG4gICAgfVxuICB9LCBbQ29tcG9uZW50Lmd1ZXN0T25seSwgQ29tcG9uZW50LnJlcXVpcmVBdXRoLCBsb2FkaW5nLCByb3V0ZXIsIHVzZXJdKTtcblxuICBpZiAobG9hZGluZykge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cImxvYWRpbmdcIj5Mb2FkaW5nLi4uPC9kaXY+O1xuICB9XG5cbiAgaWYgKENvbXBvbmVudC5yZXF1aXJlQXV0aCAmJiAhdXNlcikge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cImxvYWRpbmdcIj5SZWRpcmVjdGluZyB0byBsb2dpbi4uLjwvZGl2PjtcbiAgfVxuXG4gIGlmIChDb21wb25lbnQuZ3Vlc3RPbmx5ICYmIHVzZXIpIHtcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJsb2FkaW5nXCI+UmVkaXJlY3RpbmcuLi48L2Rpdj47XG4gIH1cblxuICByZXR1cm4gPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xuICByZXR1cm4gKFxuICAgIDxBdXRoUHJvdmlkZXI+XG4gICAgICA8Um91dGVHYXRlIENvbXBvbmVudD17Q29tcG9uZW50fSBwYWdlUHJvcHM9e3BhZ2VQcm9wc30gLz5cbiAgICA8L0F1dGhQcm92aWRlcj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VSb3V0ZXIiLCJBdXRoUHJvdmlkZXIiLCJ1c2VBdXRoIiwiUm91dGVHYXRlIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwidXNlciIsImxvYWRpbmciLCJyb3V0ZXIiLCJyZXF1aXJlQXV0aCIsInJlcGxhY2UiLCJndWVzdE9ubHkiLCJkaXYiLCJjbGFzc05hbWUiLCJBcHAiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./src/context/AuthContext.js":
/*!************************************!*\
  !*** ./src/context/AuthContext.js ***!
  \************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! axios */ \"axios\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([axios__WEBPACK_IMPORTED_MODULE_2__]);\naxios__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nconst useAuth = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (!context) {\n        throw new Error(\"useAuth must be used within AuthProvider\");\n    }\n    return context;\n};\nconst API_URL = \"http://localhost:5001/api\" || 0;\n/** Map axios errors to a user-visible string */ function getAuthErrorMessage(error, fallback) {\n    if (error.response?.data?.error) {\n        return error.response.data.error;\n    }\n    const errs = error.response?.data?.errors;\n    if (Array.isArray(errs) && errs.length > 0) {\n        return errs.map((e)=>e.msg || `${e.path || e.param}: invalid`).join(\" \");\n    }\n    if (error.code === \"ERR_NETWORK\" || error.message === \"Network Error\") {\n        return `Cannot reach the server. Start the API (port 5001) and set REACT_APP_API_URL if needed. Current: ${API_URL}`;\n    }\n    if (!error.response) {\n        return `No response from server. Check that the backend is running at ${API_URL.replace(/\\/api$/, \"\")}`;\n    }\n    return fallback;\n}\nconst AuthProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const token = localStorage.getItem(\"token\");\n        const userData = localStorage.getItem(\"user\");\n        if (token && userData) {\n            setUser(JSON.parse(userData));\n            axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].defaults.headers.common[\"Authorization\"] = `Bearer ${token}`;\n        }\n        setLoading(false);\n    }, []);\n    const login = async (email, password)=>{\n        try {\n            const response = await axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].post(`${API_URL}/auth/login`, {\n                email,\n                password\n            });\n            const { user, token } = response.data;\n            localStorage.setItem(\"token\", token);\n            localStorage.setItem(\"user\", JSON.stringify(user));\n            axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].defaults.headers.common[\"Authorization\"] = `Bearer ${token}`;\n            setUser(user);\n            return {\n                success: true\n            };\n        } catch (error) {\n            return {\n                success: false,\n                error: getAuthErrorMessage(error, \"Login failed\")\n            };\n        }\n    };\n    const register = async (name, email, password)=>{\n        try {\n            const response = await axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].post(`${API_URL}/auth/register`, {\n                name,\n                email,\n                password\n            });\n            const { user, token } = response.data;\n            localStorage.setItem(\"token\", token);\n            localStorage.setItem(\"user\", JSON.stringify(user));\n            axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].defaults.headers.common[\"Authorization\"] = `Bearer ${token}`;\n            setUser(user);\n            return {\n                success: true\n            };\n        } catch (error) {\n            return {\n                success: false,\n                error: getAuthErrorMessage(error, \"Registration failed\")\n            };\n        }\n    };\n    const logout = ()=>{\n        localStorage.removeItem(\"token\");\n        localStorage.removeItem(\"user\");\n        delete axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].defaults.headers.common[\"Authorization\"];\n        setUser(null);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            user,\n            login,\n            register,\n            logout,\n            loading\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"/Users/sudeshhnabehera/FinLens/frontend/src/context/AuthContext.js\",\n        lineNumber: 105,\n        columnNumber: 5\n    }, undefined);\n};\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFjLENBQUMsRUFBRTtnQkFDNUQ4QztnQkFDQVA7Z0JBQ0FDO1lBQ0Y7WUFFQSxNQUFNLEVBQUVmLElBQUksRUFBRUksS0FBSyxFQUFFLEdBQUd0QixTQUFTQyxJQUFJO1lBQ3JDc0IsYUFBYVksT0FBTyxDQUFDLFNBQVNiO1lBQzlCQyxhQUFhWSxPQUFPLENBQUMsUUFBUVQsS0FBS1UsU0FBUyxDQUFDbEI7WUFDNUM5QixzREFBYyxDQUFDeUMsT0FBTyxDQUFDQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxPQUFPLEVBQUVSLE1BQU0sQ0FBQztZQUNsRUgsUUFBUUQ7WUFFUixPQUFPO2dCQUFFbUIsU0FBUztZQUFLO1FBQ3pCLEVBQUUsT0FBT3ZDLE9BQU87WUFDZCxPQUFPO2dCQUNMdUMsU0FBUztnQkFDVHZDLE9BQU9ELG9CQUFvQkMsT0FBTztZQUNwQztRQUNGO0lBQ0Y7SUFFQSxNQUFNMEMsU0FBUztRQUNiakIsYUFBYWtCLFVBQVUsQ0FBQztRQUN4QmxCLGFBQWFrQixVQUFVLENBQUM7UUFDeEIsT0FBT3JELHNEQUFjLENBQUN5QyxPQUFPLENBQUNDLE1BQU0sQ0FBQyxnQkFBZ0I7UUFDckRYLFFBQVE7SUFDVjtJQUVBLHFCQUNFLDhEQUFDOUIsWUFBWXFELFFBQVE7UUFBQ0MsT0FBTztZQUFFekI7WUFBTWE7WUFBT087WUFBVUU7WUFBUXBCO1FBQVE7a0JBQ25FSDs7Ozs7O0FBR1AsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL2ZpbmxlbnMtZnJvbnRlbmQvLi9zcmMvY29udGV4dC9BdXRoQ29udGV4dC5qcz80YmE2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0LCB1c2VTdGF0ZSwgdXNlQ29udGV4dCwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuY29uc3QgQXV0aENvbnRleHQgPSBjcmVhdGVDb250ZXh0KCk7XG5cbmV4cG9ydCBjb25zdCB1c2VBdXRoID0gKCkgPT4ge1xuICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChBdXRoQ29udGV4dCk7XG4gIGlmICghY29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlQXV0aCBtdXN0IGJlIHVzZWQgd2l0aGluIEF1dGhQcm92aWRlcicpO1xuICB9XG4gIHJldHVybiBjb250ZXh0O1xufTtcblxuY29uc3QgQVBJX1VSTCA9XG4gIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX0FQSV9VUkwgfHxcbiAgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMS9hcGknO1xuXG4vKiogTWFwIGF4aW9zIGVycm9ycyB0byBhIHVzZXItdmlzaWJsZSBzdHJpbmcgKi9cbmZ1bmN0aW9uIGdldEF1dGhFcnJvck1lc3NhZ2UoZXJyb3IsIGZhbGxiYWNrKSB7XG4gIGlmIChlcnJvci5yZXNwb25zZT8uZGF0YT8uZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3IucmVzcG9uc2UuZGF0YS5lcnJvcjtcbiAgfVxuICBjb25zdCBlcnJzID0gZXJyb3IucmVzcG9uc2U/LmRhdGE/LmVycm9ycztcbiAgaWYgKEFycmF5LmlzQXJyYXkoZXJycykgJiYgZXJycy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGVycnMubWFwKChlKSA9PiBlLm1zZyB8fCBgJHtlLnBhdGggfHwgZS5wYXJhbX06IGludmFsaWRgKS5qb2luKCcgJyk7XG4gIH1cbiAgaWYgKGVycm9yLmNvZGUgPT09ICdFUlJfTkVUV09SSycgfHwgZXJyb3IubWVzc2FnZSA9PT0gJ05ldHdvcmsgRXJyb3InKSB7XG4gICAgcmV0dXJuIGBDYW5ub3QgcmVhY2ggdGhlIHNlcnZlci4gU3RhcnQgdGhlIEFQSSAocG9ydCA1MDAxKSBhbmQgc2V0IFJFQUNUX0FQUF9BUElfVVJMIGlmIG5lZWRlZC4gQ3VycmVudDogJHtBUElfVVJMfWA7XG4gIH1cbiAgaWYgKCFlcnJvci5yZXNwb25zZSkge1xuICAgIHJldHVybiBgTm8gcmVzcG9uc2UgZnJvbSBzZXJ2ZXIuIENoZWNrIHRoYXQgdGhlIGJhY2tlbmQgaXMgcnVubmluZyBhdCAke0FQSV9VUkwucmVwbGFjZSgvXFwvYXBpJC8sICcnKX1gO1xuICB9XG4gIHJldHVybiBmYWxsYmFjaztcbn1cblxuZXhwb3J0IGNvbnN0IEF1dGhQcm92aWRlciA9ICh7IGNoaWxkcmVuIH0pID0+IHtcbiAgY29uc3QgW3VzZXIsIHNldFVzZXJdID0gdXNlU3RhdGUobnVsbCk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKTtcbiAgICBjb25zdCB1c2VyRGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyJyk7XG4gICAgXG4gICAgaWYgKHRva2VuICYmIHVzZXJEYXRhKSB7XG4gICAgICBzZXRVc2VyKEpTT04ucGFyc2UodXNlckRhdGEpKTtcbiAgICAgIGF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydBdXRob3JpemF0aW9uJ10gPSBgQmVhcmVyICR7dG9rZW59YDtcbiAgICB9XG4gICAgXG4gICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gIH0sIFtdKTtcblxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChlbWFpbCwgcGFzc3dvcmQpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0KGAke0FQSV9VUkx9L2F1dGgvbG9naW5gLCB7XG4gICAgICAgIGVtYWlsLFxuICAgICAgICBwYXNzd29yZFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHsgdXNlciwgdG9rZW4gfSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCB0b2tlbik7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcicsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcbiAgICAgIGF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydBdXRob3JpemF0aW9uJ10gPSBgQmVhcmVyICR7dG9rZW59YDtcbiAgICAgIHNldFVzZXIodXNlcik7XG4gICAgICBcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBnZXRBdXRoRXJyb3JNZXNzYWdlKGVycm9yLCAnTG9naW4gZmFpbGVkJylcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlZ2lzdGVyID0gYXN5bmMgKG5hbWUsIGVtYWlsLCBwYXNzd29yZCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLnBvc3QoYCR7QVBJX1VSTH0vYXV0aC9yZWdpc3RlcmAsIHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZW1haWwsXG4gICAgICAgIHBhc3N3b3JkXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgeyB1c2VyLCB0b2tlbiB9ID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIHRva2VuKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyJywgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xuICAgICAgYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ0F1dGhvcml6YXRpb24nXSA9IGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgICAgc2V0VXNlcih1c2VyKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGdldEF1dGhFcnJvck1lc3NhZ2UoZXJyb3IsICdSZWdpc3RyYXRpb24gZmFpbGVkJylcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGxvZ291dCA9ICgpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcicpO1xuICAgIGRlbGV0ZSBheGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnQXV0aG9yaXphdGlvbiddO1xuICAgIHNldFVzZXIobnVsbCk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgdXNlciwgbG9naW4sIHJlZ2lzdGVyLCBsb2dvdXQsIGxvYWRpbmcgfX0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn07XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJjcmVhdGVDb250ZXh0IiwidXNlU3RhdGUiLCJ1c2VDb250ZXh0IiwidXNlRWZmZWN0IiwiYXhpb3MiLCJBdXRoQ29udGV4dCIsInVzZUF1dGgiLCJjb250ZXh0IiwiRXJyb3IiLCJBUElfVVJMIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX0FQSV9VUkwiLCJnZXRBdXRoRXJyb3JNZXNzYWdlIiwiZXJyb3IiLCJmYWxsYmFjayIsInJlc3BvbnNlIiwiZGF0YSIsImVycnMiLCJlcnJvcnMiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJtYXAiLCJlIiwibXNnIiwicGF0aCIsInBhcmFtIiwiam9pbiIsImNvZGUiLCJtZXNzYWdlIiwicmVwbGFjZSIsIkF1dGhQcm92aWRlciIsImNoaWxkcmVuIiwidXNlciIsInNldFVzZXIiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsInRva2VuIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInVzZXJEYXRhIiwiSlNPTiIsInBhcnNlIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiY29tbW9uIiwibG9naW4iLCJlbWFpbCIsInBhc3N3b3JkIiwicG9zdCIsInNldEl0ZW0iLCJzdHJpbmdpZnkiLCJzdWNjZXNzIiwicmVnaXN0ZXIiLCJuYW1lIiwibG9nb3V0IiwicmVtb3ZlSXRlbSIsIlByb3ZpZGVyIiwidmFsdWUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/context/AuthContext.js\n");

/***/ }),

/***/ "./src/App.css":
/*!*********************!*\
  !*** ./src/App.css ***!
  \*********************/
/***/ (() => {



/***/ }),

/***/ "./src/components/Navbar.css":
/*!***********************************!*\
  !*** ./src/components/Navbar.css ***!
  \***********************************/
/***/ (() => {



/***/ }),

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ (() => {



/***/ }),

/***/ "./src/pages/Auth.css":
/*!****************************!*\
  !*** ./src/pages/Auth.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "./src/pages/Dashboard.css":
/*!*********************************!*\
  !*** ./src/pages/Dashboard.css ***!
  \*********************************/
/***/ (() => {



/***/ }),

/***/ "./src/pages/Expenses.css":
/*!********************************!*\
  !*** ./src/pages/Expenses.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "./src/pages/Groups.css":
/*!******************************!*\
  !*** ./src/pages/Groups.css ***!
  \******************************/
/***/ (() => {



/***/ }),

/***/ "./src/pages/Insights.css":
/*!********************************!*\
  !*** ./src/pages/Insights.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "./src/pages/Portfolio.css":
/*!*********************************!*\
  !*** ./src/pages/Portfolio.css ***!
  \*********************************/
/***/ (() => {



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

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = import("axios");;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();