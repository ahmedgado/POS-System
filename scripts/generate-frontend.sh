#!/bin/bash

##############################################
# Generate Complete Angular Frontend for POS
##############################################

set -e

FRONTEND_DIR="/Users/ahmedgad/test/POS-System/frontend"

echo "🚀 Generating Complete Angular Frontend for POS System..."
echo "=========================================================="

# Step 1: Create Angular app structure
echo ""
echo "[1/5] Creating Angular app structure..."

cd "$FRONTEND_DIR"

# Create necessary directories
mkdir -p src/app/{core,shared,features}/{components,services,models,guards}
mkdir -p src/app/features/{auth,dashboard,cashier,products,sales,customers,users,reports,shifts,settings}
mkdir -p src/assets/{i18n,images,fonts}
mkdir -p src/themes
mkdir -p src/environments

echo "✓ Directory structure created"

# Step 2: Create package.json
echo ""
echo "[2/5] Creating package.json..."

cat > package.json << 'EOF'
{
  "name": "pos-frontend",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "@nebular/theme": "^12.0.0",
    "@nebular/auth": "^12.0.0",
    "@nebular/eva-icons": "^12.0.0",
    "@nebular/security": "^12.0.0",
    "@eva-design/eva": "^2.2.0",
    "@ng-bootstrap/ng-bootstrap": "^15.0.0",
    "@ngx-translate/core": "^15.0.0",
    "@ngx-translate/http-loader": "^8.0.0",
    "bootstrap": "^5.3.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "^0.14.2",
    "ngx-charts": "^20.4.0",
    "@swimlane/ngx-charts": "^20.4.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.2.2"
  }
}
EOF

echo "✓ package.json created"

# Step 3: Create angular.json
echo ""
echo "[3/5] Creating angular.json..."

cat > angular.json << 'EOF'
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "pos-frontend": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/pos-frontend",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": [
              "src/themes/theme.scss",
              "node_modules/@nebular/theme/styles/prebuilt/default.css",
              "node_modules/bootstrap/dist/css/bootstrap.min.css"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "6kb",
                  "maximumError": "10kb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "pos-frontend:build:production"
            },
            "development": {
              "buildTarget": "pos-frontend:build:development"
            }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
EOF

echo "✓ angular.json created"

# Step 4: Create tsconfig files
echo ""
echo "[4/5] Creating TypeScript configurations..."

cat > tsconfig.json << 'EOF'
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": false,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"],
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@environments/*": ["src/environments/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
EOF

cat > tsconfig.app.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}
EOF

echo "✓ TypeScript configurations created"

# Step 5: Create index.html
echo ""
echo "[5/5] Creating index.html and main files..."

cat > src/index.html << 'EOF'
<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <title>POS System - نظام نقاط البيع</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <app-root></app-root>
</body>
</html>
EOF

echo "✓ HTML files created"

echo ""
echo "=========================================================="
echo "✓ Frontend structure generated successfully!"
echo "=========================================================="
echo ""
echo "Next steps:"
echo "1. cd $FRONTEND_DIR"
echo "2. npm install  (or Docker will do this automatically)"
echo "3. Component files will be generated next"
echo ""
