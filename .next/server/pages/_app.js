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

eval("// Exports\nmodule.exports = {\n\t\"navbar\": \"Navbar_navbar__zhZYq\",\n\t\"slideDown\": \"Navbar_slideDown__aQBpy\",\n\t\"open\": \"Navbar_open__saUDJ\",\n\t\"hamburger\": \"Navbar_hamburger__FOAYs\",\n\t\"bar\": \"Navbar_bar__XFH5V\",\n\t\"navList\": \"Navbar_navList__HoER4\",\n\t\"navItem\": \"Navbar_navItem__5nyab\",\n\t\"navLink\": \"Navbar_navLink__VR3HP\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zdHlsZXMvTmF2YmFyLm1vZHVsZS5jc3MiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxCcnVrZXJcXERvY3VtZW50c1xcQ29kZVxcQ3Vyc29yXFxtaW1iZWx3aXRoY2FyXFxtaW1iZWxcXHN0eWxlc1xcTmF2YmFyLm1vZHVsZS5jc3MiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gRXhwb3J0c1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwibmF2YmFyXCI6IFwiTmF2YmFyX25hdmJhcl9femhaWXFcIixcblx0XCJzbGlkZURvd25cIjogXCJOYXZiYXJfc2xpZGVEb3duX19hUUJweVwiLFxuXHRcIm9wZW5cIjogXCJOYXZiYXJfb3Blbl9fc2FVREpcIixcblx0XCJoYW1idXJnZXJcIjogXCJOYXZiYXJfaGFtYnVyZ2VyX19GT0FZc1wiLFxuXHRcImJhclwiOiBcIk5hdmJhcl9iYXJfX1hGSDVWXCIsXG5cdFwibmF2TGlzdFwiOiBcIk5hdmJhcl9uYXZMaXN0X19Ib0VSNFwiLFxuXHRcIm5hdkl0ZW1cIjogXCJOYXZiYXJfbmF2SXRlbV9fNW55YWJcIixcblx0XCJuYXZMaW5rXCI6IFwiTmF2YmFyX25hdkxpbmtfX1ZSM0hQXCJcbn07XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./styles/Navbar.module.css\n");

/***/ }),

/***/ "./components/Navbar.js":
/*!******************************!*\
  !*** ./components/Navbar.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/link */ \"./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/Navbar.module.css */ \"./styles/Navbar.module.css\");\n/* harmony import */ var _styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst Navbar = ()=>{\n    const [menuOpen, setMenuOpen] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false); // State to toggle the menu visibility\n    const toggleMenu = ()=>{\n        setMenuOpen(!menuOpen);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"nav\", {\n        className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().navbar),\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().hamburger),\n                onClick: toggleMenu,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                        className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().bar)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 15,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                        className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().bar)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 16,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                        className: (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().bar)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 17,\n                        columnNumber: 9\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                lineNumber: 14,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"ul\", {\n                className: `${(_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().menu)} ${menuOpen ? (_styles_Navbar_module_css__WEBPACK_IMPORTED_MODULE_3___default().open) : \"\"}`,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/\",\n                            children: \"Home\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 20,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 20,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/site1\",\n                            children: \"Flaguesser\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 21,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 21,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/site2\",\n                            children: \"Flags\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 22,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 22,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/site3\",\n                            children: \"Monkeyroller\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 23,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 23,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/site4\",\n                            children: \"Dev\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                            lineNumber: 24,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                        lineNumber: 24,\n                        columnNumber: 9\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n                lineNumber: 19,\n                columnNumber: 7\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\components\\\\Navbar.js\",\n        lineNumber: 13,\n        columnNumber: 5\n    }, undefined);\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Navbar);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL05hdmJhci5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQWlDO0FBQ0o7QUFDb0I7QUFFakQsTUFBTUcsU0FBUztJQUNiLE1BQU0sQ0FBQ0MsVUFBVUMsWUFBWSxHQUFHTCwrQ0FBUUEsQ0FBQyxRQUFRLHNDQUFzQztJQUV2RixNQUFNTSxhQUFhO1FBQ2pCRCxZQUFZLENBQUNEO0lBQ2Y7SUFFQSxxQkFDRSw4REFBQ0c7UUFBSUMsV0FBV04seUVBQWE7OzBCQUMzQiw4REFBQ1E7Z0JBQUlGLFdBQVdOLDRFQUFnQjtnQkFBRVUsU0FBU047O2tDQUN6Qyw4REFBQ087d0JBQUtMLFdBQVdOLHNFQUFVOzs7Ozs7a0NBQzNCLDhEQUFDVzt3QkFBS0wsV0FBV04sc0VBQVU7Ozs7OztrQ0FDM0IsOERBQUNXO3dCQUFLTCxXQUFXTixzRUFBVTs7Ozs7Ozs7Ozs7OzBCQUU3Qiw4REFBQ2E7Z0JBQUdQLFdBQVcsR0FBR04sdUVBQVcsQ0FBQyxDQUFDLEVBQUVFLFdBQVdGLHVFQUFXLEdBQUcsSUFBSTs7a0NBQzVELDhEQUFDZ0I7a0NBQUcsNEVBQUNqQixrREFBSUE7NEJBQUNrQixNQUFLO3NDQUFJOzs7Ozs7Ozs7OztrQ0FDbkIsOERBQUNEO2tDQUFHLDRFQUFDakIsa0RBQUlBOzRCQUFDa0IsTUFBSztzQ0FBUzs7Ozs7Ozs7Ozs7a0NBQ3hCLDhEQUFDRDtrQ0FBRyw0RUFBQ2pCLGtEQUFJQTs0QkFBQ2tCLE1BQUs7c0NBQVM7Ozs7Ozs7Ozs7O2tDQUN4Qiw4REFBQ0Q7a0NBQUcsNEVBQUNqQixrREFBSUE7NEJBQUNrQixNQUFLO3NDQUFTOzs7Ozs7Ozs7OztrQ0FDeEIsOERBQUNEO2tDQUFHLDRFQUFDakIsa0RBQUlBOzRCQUFDa0IsTUFBSztzQ0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJaEM7QUFFQSxpRUFBZWhCLE1BQU1BLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQnJ1a2VyXFxEb2N1bWVudHNcXENvZGVcXEN1cnNvclxcbWltYmVsd2l0aGNhclxcbWltYmVsXFxjb21wb25lbnRzXFxOYXZiYXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBMaW5rIGZyb20gXCJuZXh0L2xpbmtcIjtcbmltcG9ydCBzdHlsZXMgZnJvbSBcIi4uL3N0eWxlcy9OYXZiYXIubW9kdWxlLmNzc1wiO1xuXG5jb25zdCBOYXZiYXIgPSAoKSA9PiB7XG4gIGNvbnN0IFttZW51T3Blbiwgc2V0TWVudU9wZW5dID0gdXNlU3RhdGUoZmFsc2UpOyAvLyBTdGF0ZSB0byB0b2dnbGUgdGhlIG1lbnUgdmlzaWJpbGl0eVxuXG4gIGNvbnN0IHRvZ2dsZU1lbnUgPSAoKSA9PiB7XG4gICAgc2V0TWVudU9wZW4oIW1lbnVPcGVuKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtzdHlsZXMubmF2YmFyfT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMuaGFtYnVyZ2VyfSBvbkNsaWNrPXt0b2dnbGVNZW51fT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtzdHlsZXMuYmFyfT48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c3R5bGVzLmJhcn0+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy5iYXJ9Pjwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPHVsIGNsYXNzTmFtZT17YCR7c3R5bGVzLm1lbnV9ICR7bWVudU9wZW4gPyBzdHlsZXMub3BlbiA6IFwiXCJ9YH0+XG4gICAgICAgIDxsaT48TGluayBocmVmPVwiL1wiPkhvbWU8L0xpbms+PC9saT5cbiAgICAgICAgPGxpPjxMaW5rIGhyZWY9XCIvc2l0ZTFcIj5GbGFndWVzc2VyPC9MaW5rPjwvbGk+XG4gICAgICAgIDxsaT48TGluayBocmVmPVwiL3NpdGUyXCI+RmxhZ3M8L0xpbms+PC9saT5cbiAgICAgICAgPGxpPjxMaW5rIGhyZWY9XCIvc2l0ZTNcIj5Nb25rZXlyb2xsZXI8L0xpbms+PC9saT5cbiAgICAgICAgPGxpPjxMaW5rIGhyZWY9XCIvc2l0ZTRcIj5EZXY8L0xpbms+PC9saT5cbiAgICAgIDwvdWw+XG4gICAgPC9uYXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBOYXZiYXI7XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJMaW5rIiwic3R5bGVzIiwiTmF2YmFyIiwibWVudU9wZW4iLCJzZXRNZW51T3BlbiIsInRvZ2dsZU1lbnUiLCJuYXYiLCJjbGFzc05hbWUiLCJuYXZiYXIiLCJkaXYiLCJoYW1idXJnZXIiLCJvbkNsaWNrIiwic3BhbiIsImJhciIsInVsIiwibWVudSIsIm9wZW4iLCJsaSIsImhyZWYiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./components/Navbar.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_Navbar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Navbar */ \"./components/Navbar.js\");\n// pages/_app.js\n\n // Import global styles (if you have them)\n // Import your common Navbar (optional)\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\pages\\\\_app.js\",\n                lineNumber: 8,\n                columnNumber: 7\n            }, this),\n            \" \"\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\Bruker\\\\Documents\\\\Code\\\\Cursor\\\\mimbelwithcar\\\\mimbel\\\\pages\\\\_app.js\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLGdCQUFnQjs7QUFDZSxDQUFDLDBDQUEwQztBQUNoQyxDQUFDLHVDQUF1QztBQUVsRixTQUFTQyxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ3JDLHFCQUNFLDhEQUFDQzs7MEJBQ0MsOERBQUNGO2dCQUFXLEdBQUdDLFNBQVM7Ozs7OztZQUFJOzs7Ozs7O0FBR2xDO0FBRUEsaUVBQWVGLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQnJ1a2VyXFxEb2N1bWVudHNcXENvZGVcXEN1cnNvclxcbWltYmVsd2l0aGNhclxcbWltYmVsXFxwYWdlc1xcX2FwcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBwYWdlcy9fYXBwLmpzXG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7IC8vIEltcG9ydCBnbG9iYWwgc3R5bGVzIChpZiB5b3UgaGF2ZSB0aGVtKVxuaW1wb3J0IE5hdmJhciBmcm9tICcuLi9jb21wb25lbnRzL05hdmJhcic7IC8vIEltcG9ydCB5b3VyIGNvbW1vbiBOYXZiYXIgKG9wdGlvbmFsKVxuXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPiB7LyogVGhpcyByZW5kZXJzIHRoZSBzcGVjaWZpYyBwYWdlIGNvbXBvbmVudCAqL31cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTXlBcHA7XG4iXSwibmFtZXMiOlsiTmF2YmFyIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJkaXYiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

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