# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-10-13

### ✨ Added
- **Random emoji generation**: New `randomize()` method for creating random emojis
- **Configurable canvas size**: Support for custom width/height in constructor
- **Multiple output formats**: Support for PNG and JPEG output formats
- **TypeScript definitions**: Full TypeScript support with comprehensive type definitions
- **Component validation**: Better validation with specific error messages for each field
- **Preview functionality**: Enhanced `List` class with better component display options
- **Test suite**: Comprehensive tests covering all functionality
- **Input validation on build**: Ensures at least a base is provided before building

### 🔧 Improved
- **Error handling**: Replaced inconsistent error classes with proper `ValidationError`
- **Documentation**: Complete rewrite of README with detailed API documentation
- **JSDoc comments**: Comprehensive documentation for all methods and parameters
- **Code quality**: Removed commented code, console.log statements, and improved structure
- **Package.json**: Added proper description, removed unnecessary dependencies, added engines field

### 🛠️ Fixed
- **Dependency issues**: Removed unnecessary `fs` dependency (built-in Node.js module)
- **Hardcoded values**: Made canvas size configurable instead of fixed 128x128
- **Missing validation**: Added validation to ensure base is provided before building
- **Error messages**: More descriptive error messages with field names

### 📚 Technical Improvements
- **Method chaining**: All builder methods now properly return `this`
- **Async handling**: Improved error handling in async operations
- **File structure**: Better organization with types directory and test directory
- **Performance**: Better error handling for missing image files
- **Made everything foolproof**: Catches everything and provide helpful tips

## [1.0.4] - Previous Version

### Features
- Basic emoji creation with parts selection
- Canvas-based image generation
- Component listing functionality