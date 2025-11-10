"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIGHT_CHARTER = void 0;
exports.isPrincipleEnabled = isPrincipleEnabled;
exports.getEnabledPrinciples = getEnabledPrinciples;
exports.getPrinciple = getPrinciple;
exports.validateCriticalPrinciples = validateCriticalPrinciples;
const charter = __importStar(require("./light-charter.json"));
exports.LIGHT_CHARTER = charter;
function isPrincipleEnabled(key) {
    const principle = exports.LIGHT_CHARTER.principles[key];
    return principle?.enabled ?? false;
}
function getEnabledPrinciples() {
    return Object.keys(exports.LIGHT_CHARTER.principles).filter(key => isPrincipleEnabled(key));
}
function getPrinciple(key) {
    return exports.LIGHT_CHARTER.principles[key];
}
function validateCriticalPrinciples() {
    const principles = exports.LIGHT_CHARTER.principles;
    const disabledCritical = [];
    for (const [key, principle] of Object.entries(principles)) {
        if (principle.severity === 'critical' && !principle.enabled) {
            disabledCritical.push(key);
        }
    }
    if (disabledCritical.length > 0) {
        throw new Error(`Critical principles must be enabled: ${disabledCritical.join(', ')}`);
    }
}
validateCriticalPrinciples();
exports.default = {
    LIGHT_CHARTER: exports.LIGHT_CHARTER,
    isPrincipleEnabled,
    getEnabledPrinciples,
    getPrinciple,
    validateCriticalPrinciples
};
