"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performClone = performClone;
exports.performAdd = performAdd;
var git = require("isomorphic-git");
var expo_file_system_1 = require("expo-file-system"); // Added Directory
var gitHTTP_1 = require("@/lib/gitHTTP");
var expoFsAdapter_1 = require("@/lib/expoFsAdapter");
/**
 * Performes a git clone , similar to the command `git clone <url> <dir>`
 * NOTE: does not do/allow for a shallow clone, could lead to OOM or OOS
 */
function performClone(remoteUrl, dirName) {
    return __awaiter(this, void 0, void 0, function () {
        var folder, repoDirObj, repoDirUri, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    folder = (_b = dirName !== null && dirName !== void 0 ? dirName : (_a = remoteUrl.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.git', '')) !== null && _b !== void 0 ? _b : 'new-project';
                    repoDirObj = new expo_file_system_1.Directory(expo_file_system_1.Paths.document, folder);
                    repoDirUri = repoDirObj.uri;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    console.log("Cloning ".concat(remoteUrl, " into ").concat(repoDirUri, "..."));
                    return [4 /*yield*/, git.clone({
                            fs: expoFsAdapter_1.expoFsAdapter,
                            http: gitHTTP_1.gitHTTP,
                            dir: repoDirUri,
                            url: remoteUrl,
                            singleBranch: true,
                            onProgress: function (progress) {
                                console.log("Phase: ".concat(progress.phase, " | ").concat(progress.loaded, "/").concat(progress.total));
                            }
                        })];
                case 2:
                    _c.sent();
                    console.log('Clone successful');
                    return [2 /*return*/, { success: true, dir: repoDirUri, directoryObject: repoDirObj }];
                case 3:
                    err_1 = _c.sent();
                    console.error('Clone failed:', err_1);
                    return [2 /*return*/, { success: false, error: err_1 }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Performes a git add, similar to the command `git add <>`
 * Takes in a single path or a list of paths
 */
function performAdd(dir, filepath) {
    return __awaiter(this, void 0, void 0, function () {
        var filepaths, _i, filepaths_1, file, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    filepaths = Array.isArray(filepath) ? filepath : [filepath];
                    _i = 0, filepaths_1 = filepaths;
                    _a.label = 1;
                case 1:
                    if (!(_i < filepaths_1.length)) return [3 /*break*/, 4];
                    file = filepaths_1[_i];
                    return [4 /*yield*/, git.add({
                            fs: expoFsAdapter_1.expoFsAdapter,
                            dir: dir,
                            filepath: file,
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, { success: true }];
                case 5:
                    err_2 = _a.sent();
                    return [2 /*return*/, { success: false, error: err_2 }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
