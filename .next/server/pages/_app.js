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

/***/ "./styles/Navbar.module.css":
/*!**********************************!*\
  !*** ./styles/Navbar.module.css ***!
  \**********************************/
/***/ ((module) => {

eval("// Exports\nmodule.exports = {\n\t\"navbar\": \"Navbar_navbar__zhZYq\",\n\t\"slideDown\": \"Navbar_slideDown__aQBpy\",\n\t\"open\": \"Navbar_open__saUDJ\",\n\t\"hamburger\": \"Navbar_hamburger__FOAYs\",\n\t\"bar\": \"Navbar_bar__XFH5V\",\n\t\"navList\": \"Navbar_navList__HoER4\",\n\t\"navItem\": \"Navbar_navItem__5nyab\",\n\t\"navLink\": \"Navbar_navLink__VR3HP\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zdHlsZXMvTmF2YmFyLm1vZHVsZS5jc3MiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxCcnVrZXJcXERvY3VtZW50c1xcQ29kZVxcZmxhZ2d1ZXNzZXIgMlxcbWltYmVsXFxzdHlsZXNcXE5hdmJhci5tb2R1bGUuY3NzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEV4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcIm5hdmJhclwiOiBcIk5hdmJhcl9uYXZiYXJfX3poWllxXCIsXG5cdFwic2xpZGVEb3duXCI6IFwiTmF2YmFyX3NsaWRlRG93bl9fYVFCcHlcIixcblx0XCJvcGVuXCI6IFwiTmF2YmFyX29wZW5fX3NhVURKXCIsXG5cdFwiaGFtYnVyZ2VyXCI6IFwiTmF2YmFyX2hhbWJ1cmdlcl9fRk9BWXNcIixcblx0XCJiYXJcIjogXCJOYXZiYXJfYmFyX19YRkg1VlwiLFxuXHRcIm5hdkxpc3RcIjogXCJOYXZiYXJfbmF2TGlzdF9fSG9FUjRcIixcblx0XCJuYXZJdGVtXCI6IFwiTmF2YmFyX25hdkl0ZW1fXzVueWFiXCIsXG5cdFwibmF2TGlua1wiOiBcIk5hdmJhcl9uYXZMaW5rX19WUjNIUFwiXG59O1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./styles/Navbar.module.css\n");

/***/ }),

/***/ "./components/Navbar.js":
/*!******************************!*\
  !*** ./components/Navbar.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/link */ \"./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/Navbar.module.css */ \"./styles/Navbar.module.css\");\n/* harmony import */ var _styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst Navbar = ()=>{\n    const [menuOpen, setMenuOpen] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false); // State to toggle the menu visibility\n    const toggleMenu = ()=>{\n        setMenuOpen(!menuOpen);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"nav\", {\n        className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().navbar),\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().hamburger),\n                onClick: toggleMenu,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                        className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().bar)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 15,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                        className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().bar)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 16,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                        className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().bar)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 17,\n                        columnNumber: 9\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                lineNumber: 14,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"ul\", {\n                className: `${(_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().menu)} ${menuOpen ? (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().open) : \"\"}`,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/\",\n                            children: \"Home\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 20,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 20,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/site1\",\n                            children: \"Flaguesser\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 21,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 21,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/site2\",\n                            children: \"Flags\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 22,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 22,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/site3\",\n                            children: \"Monkeyroller\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 23,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 23,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/site4\",\n                            children: \"Dev\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 24,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 24,\n                        columnNumber: 9\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n                lineNumber: 19,\n                columnNumber: 7\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\components\\\\Navbar.js\",\n        lineNumber: 13,\n        columnNumber: 5\n    }, undefined);\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Navbar);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL05hdmJhci5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQWlDO0FBQ0o7QUFDb0I7QUFFakQsTUFBTUcsU0FBUztJQUNiLE1BQU0sQ0FBQ0MsVUFBVUMsWUFBWSxHQUFHTCwrQ0FBUUEsQ0FBQyxRQUFRLHNDQUFzQztJQUV2RixNQUFNTSxhQUFhO1FBQ2pCRCxZQUFZLENBQUNEO0lBQ2Y7SUFFQSxxQkFDRSw4REFBQ0c7UUFBSUMsV0FBV04seUVBQWE7OzBCQUMzQiw4REFBQ1E7Z0JBQUlGLFdBQVdOLDRFQUFnQjtnQkFBRVUsU0FBU047O2tDQUN6Qyw4REFBQ087d0JBQUtMLFdBQVdOLHNFQUFVOzs7Ozs7a0NBQzNCLDhEQUFDVzt3QkFBS0wsV0FBV04sc0VBQVU7Ozs7OztrQ0FDM0IsOERBQUNXO3dCQUFLTCxXQUFXTixzRUFBVTs7Ozs7Ozs7Ozs7OzBCQUU3Qiw4REFBQ2E7Z0JBQUdQLFdBQVcsR0FBR04sdUVBQVcsQ0FBQyxDQUFDLEVBQUVFLFdBQVdGLHVFQUFXLEdBQUcsSUFBSTs7a0NBQzVELDhEQUFDZ0I7a0NBQUcsNEVBQUNqQixrREFBSUE7NEJBQUNrQixNQUFLO3NDQUFJOzs7Ozs7Ozs7OztrQ0FDbkIsOERBQUNEO2tDQUFHLDRFQUFDakIsa0RBQUlBOzRCQUFDa0IsTUFBSztzQ0FBUzs7Ozs7Ozs7Ozs7a0NBQ3hCLDhEQUFDRDtrQ0FBRyw0RUFBQ2pCLGtEQUFJQTs0QkFBQ2tCLE1BQUs7c0NBQVM7Ozs7Ozs7Ozs7O2tDQUN4Qiw4REFBQ0Q7a0NBQUcsNEVBQUNqQixrREFBSUE7NEJBQUNrQixNQUFLO3NDQUFTOzs7Ozs7Ozs7OztrQ0FDeEIsOERBQUNEO2tDQUFHLDRFQUFDakIsa0RBQUlBOzRCQUFDa0IsTUFBSztzQ0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJaEM7QUFFQSxpRUFBZWhCLE1BQU1BLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQnJ1a2VyXFxEb2N1bWVudHNcXENvZGVcXGZsYWdndWVzc2VyIDJcXG1pbWJlbFxcY29tcG9uZW50c1xcTmF2YmFyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCBMaW5rIGZyb20gXCJuZXh0L2xpbmtcIjtcclxuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi4vc3R5bGVzL05hdmJhci5tb2R1bGUuY3NzXCI7XHJcblxyXG5jb25zdCBOYXZiYXIgPSAoKSA9PiB7XHJcbiAgY29uc3QgW21lbnVPcGVuLCBzZXRNZW51T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7IC8vIFN0YXRlIHRvIHRvZ2dsZSB0aGUgbWVudSB2aXNpYmlsaXR5XHJcblxyXG4gIGNvbnN0IHRvZ2dsZU1lbnUgPSAoKSA9PiB7XHJcbiAgICBzZXRNZW51T3BlbighbWVudU9wZW4pO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8bmF2IGNsYXNzTmFtZT17c3R5bGVzLm5hdmJhcn0+XHJcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMuaGFtYnVyZ2VyfSBvbkNsaWNrPXt0b2dnbGVNZW51fT5cclxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy5iYXJ9Pjwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy5iYXJ9Pjwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy5iYXJ9Pjwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDx1bCBjbGFzc05hbWU9e2Ake3N0eWxlcy5tZW51fSAke21lbnVPcGVuID8gc3R5bGVzLm9wZW4gOiBcIlwifWB9PlxyXG4gICAgICAgIDxsaT48TGluayBocmVmPVwiL1wiPkhvbWU8L0xpbms+PC9saT5cclxuICAgICAgICA8bGk+PExpbmsgaHJlZj1cIi9zaXRlMVwiPkZsYWd1ZXNzZXI8L0xpbms+PC9saT5cclxuICAgICAgICA8bGk+PExpbmsgaHJlZj1cIi9zaXRlMlwiPkZsYWdzPC9MaW5rPjwvbGk+XHJcbiAgICAgICAgPGxpPjxMaW5rIGhyZWY9XCIvc2l0ZTNcIj5Nb25rZXlyb2xsZXI8L0xpbms+PC9saT5cclxuICAgICAgICA8bGk+PExpbmsgaHJlZj1cIi9zaXRlNFwiPkRldjwvTGluaz48L2xpPlxyXG4gICAgICA8L3VsPlxyXG4gICAgPC9uYXY+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE5hdmJhcjtcclxuIl0sIm5hbWVzIjpbInVzZVN0YXRlIiwiTGluayIsInN0eWxlcyIsIk5hdmJhciIsIm1lbnVPcGVuIiwic2V0TWVudU9wZW4iLCJ0b2dnbGVNZW51IiwibmF2IiwiY2xhc3NOYW1lIiwibmF2YmFyIiwiZGl2IiwiaGFtYnVyZ2VyIiwib25DbGljayIsInNwYW4iLCJiYXIiLCJ1bCIsIm1lbnUiLCJvcGVuIiwibGkiLCJocmVmIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/Navbar.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_Navbar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Navbar */ \"./components/Navbar.js\");\n// pages/_app.js\n\n // Import global styles (if you have them)\n // Import your common Navbar (optional)\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\pages\\\\_app.js\",\n                lineNumber: 8,\n                columnNumber: 7\n            }, this),\n            \" \"\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\flagguesser 2\\\\mimbel\\\\pages\\\\_app.js\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLGdCQUFnQjs7QUFDZSxDQUFDLDBDQUEwQztBQUNoQyxDQUFDLHVDQUF1QztBQUVsRixTQUFTQyxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ3JDLHFCQUNFLDhEQUFDQzs7MEJBQ0MsOERBQUNGO2dCQUFXLEdBQUdDLFNBQVM7Ozs7OztZQUFJOzs7Ozs7O0FBR2xDO0FBRUEsaUVBQWVGLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQnJ1a2VyXFxEb2N1bWVudHNcXENvZGVcXGZsYWdndWVzc2VyIDJcXG1pbWJlbFxccGFnZXNcXF9hcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFnZXMvX2FwcC5qc1xyXG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7IC8vIEltcG9ydCBnbG9iYWwgc3R5bGVzIChpZiB5b3UgaGF2ZSB0aGVtKVxyXG5pbXBvcnQgTmF2YmFyIGZyb20gJy4uL2NvbXBvbmVudHMvTmF2YmFyJzsgLy8gSW1wb3J0IHlvdXIgY29tbW9uIE5hdmJhciAob3B0aW9uYWwpXHJcblxyXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcclxuICByZXR1cm4gKFxyXG4gICAgPGRpdj5cclxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPiB7LyogVGhpcyByZW5kZXJzIHRoZSBzcGVjaWZpYyBwYWdlIGNvbXBvbmVudCAqL31cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE15QXBwO1xyXG4iXSwibmFtZXMiOlsiTmF2YmFyIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJkaXYiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
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