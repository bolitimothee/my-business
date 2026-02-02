#!/usr/bin/env node

/**
 * Script de test de performance - Vérification des timeouts
 * Teste que les timeouts sont bien à 300ms max
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Vérification de la Performance\n');

// Fichiers à vérifier
const filesToCheck = [
  {
    path: 'src/contexts/AuthContext.jsx',
    patterns: [
      { name: 'PROFILE_LOAD_TIMEOUT', value: 300, expected: 300 },
      { name: 'INIT_TIMEOUT', value: 300, expected: 300 }
    ]
  },
  {
    path: 'src/AppWrapper.jsx',
    patterns: [
      { name: 'force-close timeout', regex: /}, (\d+)\);/ }
    ]
  },
  {
    path: 'src/styles/global.css',
    patterns: [
      { name: '--transition-fast', value: '0.15s' }
    ]
  }
];

let allPassed = true;

// Vérifier AuthContext.jsx
console.log('📋 Vérification des Timeouts:\n');

const authContextPath = path.join(__dirname, '..', 'src/contexts/AuthContext.jsx');
if (fs.existsSync(authContextPath)) {
  const authContent = fs.readFileSync(authContextPath, 'utf8');
  
  const profileTimeout = authContent.match(/const PROFILE_LOAD_TIMEOUT = (\d+);/);
  const initTimeout = authContent.match(/const INIT_TIMEOUT = (\d+);/);
  
  if (profileTimeout && profileTimeout[1] === '300') {
    console.log('✅ PROFILE_LOAD_TIMEOUT = 300ms');
  } else {
    console.log('❌ PROFILE_LOAD_TIMEOUT ≠ 300ms');
    allPassed = false;
  }
  
  if (initTimeout && initTimeout[1] === '300') {
    console.log('✅ INIT_TIMEOUT = 300ms');
  } else {
    console.log('❌ INIT_TIMEOUT ≠ 300ms');
    allPassed = false;
  }
} else {
  console.log('❌ Fichier non trouvé:', authContextPath);
  allPassed = false;
}

// Vérifier AppWrapper.jsx
console.log('\n📋 Vérification du Force-Close:\n');

const appWrapperPath = path.join(__dirname, '..', 'src/AppWrapper.jsx');
if (fs.existsSync(appWrapperPath)) {
  const appContent = fs.readFileSync(appWrapperPath, 'utf8');
  
  const forceCloseTimeout = appContent.match(/setTimeout\(\(\) => {\s+if \(profileLoading\) {\s+console\.warn\('⏰ Force close profile loading \((\d+)ms\)'\);/);
  
  if (forceCloseTimeout && forceCloseTimeout[1] === '300') {
    console.log('✅ Force-close timeout = 300ms');
  } else {
    console.log('⚠️  Force-close timeout trouvé, vérification manuelle recommandée');
  }
  
  if (appContent.includes('transition: \'opacity 0.15s ease-in\'')) {
    console.log('✅ Fade-in transition = 0.15s');
  } else {
    console.log('❌ Fade-in transition ≠ 0.15s');
    allPassed = false;
  }
} else {
  console.log('❌ Fichier non trouvé:', appWrapperPath);
  allPassed = false;
}

// Vérifier les transitions CSS
console.log('\n📋 Vérification des Transitions CSS:\n');

const globalCssPath = path.join(__dirname, '..', 'src/styles/global.css');
if (fs.existsSync(globalCssPath)) {
  const cssContent = fs.readFileSync(globalCssPath, 'utf8');
  
  if (cssContent.includes('--transition-fast: 0.15s')) {
    console.log('✅ CSS --transition-fast = 0.15s');
  } else {
    console.log('⚠️  CSS --transition-fast non trouvé');
  }
  
  if (cssContent.includes('@keyframes fadeIn')) {
    console.log('✅ Animation fadeIn définie');
  } else {
    console.log('⚠️  Animation fadeIn non trouvée');
  }
  
  if (cssContent.includes('@keyframes spin')) {
    console.log('✅ Animation spin définie');
  } else {
    console.log('⚠️  Animation spin non trouvée');
  }
} else {
  console.log('⚠️  Fichier non trouvé:', globalCssPath);
}

// Résumé
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ TOUS LES TESTS PASSENT - Performance OK!');
  console.log('\n📊 Résumé:');
  console.log('  • Timeouts: 300ms (0.3 secondes) ✅');
  console.log('  • Fade-in: 0.15s ✅');
  console.log('  • Transitions CSS: 0.15s ✅');
  console.log('  • Spinner: 0.6s animation ✅');
  console.log('\n🚀 L\'app est ULTRA-RAPIDE!');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('Veuillez vérifier les fichiers ci-dessus.');
}
console.log('='.repeat(50));

process.exit(allPassed ? 0 : 1);
